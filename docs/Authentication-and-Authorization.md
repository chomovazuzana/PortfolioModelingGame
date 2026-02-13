# Authentication and Authorization

## Overview

This document describes the authentication and authorization architecture for the Investment Sales Tool, including user authentication, session management, and access control.

---

## 1. Authentication Approach

### 1.1 OAuth2 with PKCE

The application uses **OAuth2 Authorization Code Flow with PKCE** (Proof Key for Code Exchange) for secure authentication.

**Key Characteristics:**
- Enterprise-grade security with zero token visibility
- Encrypted cookie-based session management
- No Active Directory integration required
- Stateless scaling across multiple servers

---

### 1.2 Architecture

```
Frontend (Next.js) → Next.js API Routes → .NET Proxy API → Backend API
                   ↑ (Encrypted cookies)   ↑ (JWT validation)  ↑ (Trusted calls)
              Zero token visibility   Multi-server scaling   Validated requests
```

---

## 2. Security Features

### 2.1 Enterprise-Grade Security

1. **Zero Token Visibility**
   - JWT tokens **NEVER** appear in browser network requests
   - No tokens in localStorage, sessionStorage, or visible cookies
   - Only encrypted data visible in httpOnly cookies

2. **Encrypted Cookie Storage**
   - Tokens AES-256-GCM encrypted in httpOnly cookies
   - Multi-cookie chunking for large tokens (>4KB)
   - Automatic expiry with cookie TTL

3. **Multi-Server Scaling**
   - All servers decrypt same cookies using shared encryption key
   - No shared storage (Redis/Database) needed
   - Stateless scaling

4. **CSRF Protection**
   - Secure PKCE implementation
   - State parameter validation
   - SameSite cookie flags

---

## 3. Authentication Flow

### 3.1 Initial Page Load

```
1. User visits application
2. AuthContext initializes → calls /api/auth/session
3. Server reads encrypted data from httpOnly cookie
4. Server decrypts tokens using AES-256 (never exposed to client)
5. If no valid session → redirect to login
6. If valid session → return user data, set authenticated state
```

### 3.2 Login Process

```
1. User clicks login → redirect to /api/auth/login
2. Server generates PKCE challenge/verifier, stores in temporary cookies
3. Redirect to OAuth2 authorization endpoint
4. User authenticates with identity provider
5. Redirect to /api/auth/callback with authorization code
6. Server exchanges code for tokens using PKCE
7. Tokens encrypted with AES-256-GCM and stored in httpOnly cookie
8. Redirect back to application
9. AuthContext re-initializes, detects authenticated session
```

### 3.3 API Calls (Zero Token Visibility)

```
1. Frontend calls /api/[endpoint]/[path]
2. Next.js API route reads encrypted cookie
3. Server decrypts JWT token using AES-256 (never exposed)
4. Adds Authorization header with token (server-side only)
5. Forwards request to .NET proxy
6. .NET proxy validates JWT token
7. .NET proxy forwards to backend
8. Response flows back through proxy chain
9. Frontend receives response (zero token exposure throughout)
```

### 3.4 Logout Process

```
1. User clicks logout → redirect to /api/auth/logout
2. Server clears encrypted session cookie
3. Redirect back to application
4. AuthContext detects unauthenticated state
```

---

## 4. User Roles and Permissions

### 4.1 Roles

The application defines two primary roles:

| Role | Description |
|:-----|:------------|
| **RM (Relationship Manager)** | Standard user role - can create and manage investment plans |
| **Admin** | Administrative role - has additional permissions including delete capabilities |

### 4.2 Role Assignment

**Role information is provided by the OAuth2 identity provider** in the JWT token claims.

**Implementation:**
- Roles/claims extracted from JWT token on backend
- Role information included in session data returned to frontend
- Frontend uses role information for UI/UX decisions (showing/hiding features)
- Backend enforces role-based access control on API endpoints

---

## 5. Access Control Rules

### 5.1 Portfolio Visibility

**Business Rule:** RMs can view investment plans created by themselves and by other RMs in the same organizational unit.

**Implementation:**

**Organizational Unit Determination:**
- Organizational unit information comes from **JWT token claims** provided by OAuth2 identity provider
- Claim name: `organizational_unit` or `department` (to be confirmed with identity provider)
- Example JWT payload:
  ```json
  {
    "sub": "user123",
    "name": "John Doe",
    "email": "john.doe@nbg.gr",
    "organizational_unit": "Athens Branch - Wealth Management",
    "role": "RM"
  }
  ```

**Database Storage:**
- Each investment plan record stores the `organizational_unit` of the RM who created it
- Query filters plans by: `created_by = current_user OR organizational_unit = current_user_org_unit`

**Example Query Logic:**
```sql
SELECT * FROM investment_plans
WHERE created_by_user_id = :current_user_id
   OR organizational_unit = :current_user_org_unit
ORDER BY created_date DESC
```

---

### 5.2 Permission Matrix

| Action | RM (Own Plans) | RM (Team Plans) | Admin |
|:-------|:--------------:|:---------------:|:-----:|
| View Plan | ✅ | ✅ | ✅ |
| Create Plan | ✅ | ✅ | ✅ |
| Edit Plan (Draft) | ✅ | ❌ | ✅ |
| Copy Plan | ✅ | ✅ | ✅ |
| Finalize Plan | ✅ | ❌ | ✅ |
| Delete Plan | ❌ | ❌ | ✅ |

**Key Rules:**
- RMs can only edit their own draft plans
- RMs can view and copy plans from their organizational unit
- Only Admins can delete plans
- Only the creator or Admin can finalize a plan

---

## 6. Session Management

### 6.1 Token Storage

**Encrypted Cookie-Based Storage:**

```typescript
// AES-256-GCM encryption with multi-cookie chunking
const cookieOptions = {
  httpOnly: true,                    // Not accessible to JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'lax' as const,          // CSRF protection
  path: '/',
  maxAge: tokenData.expires_in       // Matches token expiry
}

// Tokens encrypted and split into chunks: auth_session_0, auth_session_1, etc.
```

### 6.2 Session Persistence

- Encrypted tokens in httpOnly cookies persist across page refreshes and server restarts
- No session loss on refresh or server scaling
- Multi-server compatible - no shared storage required

### 6.3 Session Expiry

- Session expires when JWT token expires (typically 1-24 hours)
- Cookie maxAge matches token expiration
- Automatic cleanup on expiry
- User must re-authenticate when session expires

---

## 7. Security Implementation Details

### 7.1 Token Encryption

**Encryption Key:**
- 32+ character key stored in environment variable: `TOKEN_ENCRYPTION_KEY`
- Same key must be shared across all application servers
- AES-256-GCM encryption algorithm

**Multi-Cookie Chunking:**
- Large JWT tokens (>4KB) automatically split into chunks
- Each chunk stays under 4KB browser limit
- Server automatically reassembles chunks during decryption
- Cookie names: `auth_session_0`, `auth_session_1`, `auth_session_2`, etc.

### 7.2 PKCE Implementation

**PKCE (Proof Key for Code Exchange):**
- Generates code verifier and code challenge
- Stores verifier in temporary httpOnly cookie
- Sends challenge to OAuth2 authorization endpoint
- Exchanges authorization code + verifier for tokens
- Prevents authorization code interception attacks

### 7.3 CSRF Protection

**Mechanisms:**
- State parameter validated in OAuth2 callback
- SameSite cookie attribute set to 'lax'
- HttpOnly cookies not accessible to JavaScript
- Secure cookies in production (HTTPS only)

---

## 8. Environment Configuration

### 8.1 Required Environment Variables

```bash
# OAuth2 Settings
NEXT_PUBLIC_OAUTH_CLIENT_ID=your-client-id
NEXT_PUBLIC_OAUTH_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_OAUTH_SCOPE=openid profile email organizational_unit
NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://app.example.com/api/auth/callback
NEXT_PUBLIC_OAUTH_AUTHORIZATION_URL=https://identity-server/connect/authorize
NEXT_PUBLIC_OAUTH_TOKEN_URL=https://identity-server/connect/token

# Token encryption key for secure cookie storage (32 characters minimum)
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key-here

# .NET Proxy URL (server-side only)
PROXY_BASE_URL=http://localhost:5001

# Login toggle (for development/testing)
NEXT_PUBLIC_DISABLE_LOGIN=false
```

### 8.2 OAuth2 Provider Configuration

**Required Configuration at Identity Provider:**
1. Client ID and secret registered
2. Redirect URI: `https://app.example.com/api/auth/callback`
3. Allowed scopes including organizational unit claim
4. PKCE enabled
5. Token expiration settings

---

## 9. API Endpoints

### 9.1 Authentication Endpoints

| Endpoint | Method | Purpose | Authentication Required |
|:---------|:------:|:--------|:-----------------------:|
| `/api/auth/login` | GET | Initiates OAuth2 login flow | ❌ |
| `/api/auth/callback` | GET | Handles OAuth2 callback, exchanges code for tokens | ❌ |
| `/api/auth/session` | GET | Checks current session status, returns user data | ✅ (cookie) |
| `/api/auth/logout` | GET | Clears session and logs out user | ✅ (cookie) |

### 9.2 Protected API Endpoints

All business logic API endpoints require authentication:

```
/api/portfolios/*          - Investment plan management
/api/customers/*           - Customer data retrieval
/api/products/*            - Product information
/api/admin/*               - Admin-only endpoints
```

**Authentication Mechanism:**
1. Next.js API route reads encrypted cookie
2. Decrypts and validates JWT token server-side
3. Adds Authorization header for backend calls
4. Returns 401 if no valid session

---

## 10. Frontend Integration

### 10.1 AuthContext

```typescript
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  error: string | null
}

interface AuthUser {
  id: string
  name: string
  email: string
  organizationalUnit: string
  role: 'RM' | 'Admin'
}
```

### 10.2 Protected Routes

```typescript
// Higher-order component for protected routes
function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) return <LoadingSpinner />
    if (!isAuthenticated) return <Navigate to="/login" />

    return <Component {...props} />
  }
}
```

### 10.3 Role-Based UI

```typescript
// Conditional rendering based on role
function DeleteButton({ planId }) {
  const { user } = useAuth()

  if (user?.role !== 'Admin') return null

  return <Button onClick={() => deletePlan(planId)}>Delete</Button>
}
```

---

## 11. Development and Testing

### 11.1 Bypass Mode

For development and testing without OAuth2:

```bash
NEXT_PUBLIC_DISABLE_LOGIN=true
```

**When enabled:**
- Application works without authentication
- Mock user data provided
- No OAuth2 network calls
- UI components hide auth elements

### 11.2 Testing Checklist

**Security Testing:**
- [ ] No JWT tokens visible in browser network tab
- [ ] Only encrypted data visible in cookies
- [ ] No tokens in localStorage/sessionStorage
- [ ] Session cookies marked as httpOnly
- [ ] Unauthenticated requests return 401

**Functional Testing:**
- [ ] Login flow works correctly
- [ ] Session persists across page refresh
- [ ] Organizational unit filtering works
- [ ] Role-based access control enforced
- [ ] Logout clears all authentication

---

## 12. Production Deployment

### 12.1 Security Checklist

- [ ] All OAuth2 credentials secured
- [ ] HTTPS enabled for all endpoints
- [ ] Secure cookie flags enabled
- [ ] TOKEN_ENCRYPTION_KEY configured (32+ characters)
- [ ] Encryption key secured and shared across all servers
- [ ] CORS properly configured
- [ ] Environment variables validated
- [ ] Error messages sanitized

### 12.2 Scaling Considerations

**Multi-Server Deployment:**
- All servers must have same `TOKEN_ENCRYPTION_KEY`
- No shared storage required (stateless)
- Load balancer can use round-robin or sticky sessions
- Session cookies work across all servers

**Performance:**
- Encryption/decryption is fast (microseconds)
- No database lookups for token access
- Stateless scaling without infrastructure overhead

---

## 13. Troubleshooting

### 13.1 Common Issues

**"Authentication lost on page refresh"**
- Check cookie expiration settings
- Verify cookie domain/path configuration
- Ensure TOKEN_ENCRYPTION_KEY is consistent across servers

**"OAuth2 callback fails"**
- Verify redirect URI matches exactly
- Check PKCE implementation
- Validate state parameter handling

**"401 errors on API calls"**
- Check that cookies are being sent
- Verify token decryption in API routes
- Test JWT token validation
- Ensure session has not expired

**"Organizational unit filtering not working"**
- Verify organizational_unit claim in JWT token
- Check database query logic
- Confirm claim name matches identity provider

---

## 14. Migration Notes

**No Active Directory Integration:**
- Original requirements mentioned Active Directory
- Implementation uses OAuth2 with JWT claims instead
- Organizational unit information comes from identity provider
- More flexible and cloud-friendly approach

**Benefits of OAuth2 Approach:**
- Cloud-native and scalable
- Works with any OAuth2-compliant identity provider
- Better security with PKCE and encrypted cookies
- Easier to test and develop
- Multi-server ready out of the box
