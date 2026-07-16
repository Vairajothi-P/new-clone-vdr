# Project VDR Audit Report

Date: 2026-07-16

## 1. Executive Summary

The current project is a single Next.js application that mixes frontend pages, API routes, authentication, document processing, and storage orchestration in one codebase. This is acceptable for a prototype, but it is not a good foundation for 1,000 concurrent users or production deployment on AWS.

The most urgent issues are:
- build is currently failing
- the frontend and backend are tightly coupled
- auth/session handling is not production-safe
- file processing is too heavy for browser-side execution
- there is no clear scaling, monitoring, or deployment architecture for AWS

## 2. Verified Findings

### Build status
The production build was run with:
- npm run build

Result:
- build failed
- missing module errors were reported for:
  - docx-preview
  - jszip
  - xlsx
  - pdf-lib

This means the current application cannot be deployed in a production-ready state until these issues are fixed.

## 3. Architecture and Scalability Issues

### A. Monolithic structure
The app currently contains:
- UI pages under app/
- API handlers under app/api/
- authentication and document logic in the same Next.js app

For 1,000+ concurrent users, this should be split into:
- frontend service
- backend API service
- file processing service
- shared infrastructure and config

Recommended target structure:
- Frontend repo/branch: Next.js UI only
- Backend repo/branch: document APIs, auth orchestration, redaction processing
- Infra repo/branch: Terraform or CloudFormation for AWS resources

### B. Frontend and backend coupling
API routes are embedded inside the frontend app. This makes:
- independent scaling harder
- deployment more complex
- versioning and rollback harder
- code ownership more confusing

### C. Authentication/session handling
The app relies heavily on browser localStorage for session state. This is not ideal for production because:
- it is not secure for sensitive auth data
- it creates inconsistent session behavior between tabs and devices
- it complicates scaling and server-side validation

Recommended change:
- move to secure HTTP-only cookies for session/auth
- validate sessions on the backend
- use server-side middleware for auth guard

### D. Heavy document processing in the browser
The redaction and viewer flows appear to do heavy document rendering and modification in the browser. That is risky for large files and many users because:
- browser memory is limited
- CPU usage increases on the client
- user experience becomes inconsistent on lower-end devices

Recommended change:
- move heavy processing to backend workers
- upload files to object storage
- process documents asynchronously
- return job status/progress to the frontend

### E. File upload and storage strategy is not production-scale
Current upload logic appears to directly handle file buffers and storage operations in application code. For large-scale use, this should be replaced by:
- pre-signed S3 upload URLs
- multipart upload for large files
- separate storage for original and protected versions
- asynchronous post-processing jobs

### F. No clear scaling pattern for traffic spikes
For 1,000 concurrent users, the app needs:
- load balancer
- auto-scaling
- CDN for static assets
- caching
- queue-based background jobs
- observability and alerting

## 4. Security Concerns

### A. Service role key usage
The API route uses a Supabase service role key. This should be limited and carefully controlled.

Recommended change:
- avoid using service role keys in application-level logic where possible
- use least-privilege access patterns
- keep sensitive credentials in AWS Secrets Manager / environment config

### B. Client-side auth storage
Using localStorage for session/auth state is not suitable for sensitive production systems.

### C. Missing production hardening
The app needs:
- request validation
- rate limiting
- CSRF protection where required
- audit logging
- secure headers
- input sanitization

## 5. Bugs and Changes That Must Be Done

### Priority 1 - Must fix before production
1. Fix the build failures for docx-preview, jszip, xlsx, and pdf-lib
2. Split frontend and backend into separate deployment units
3. Replace localStorage-based auth/session handling with secure server-side session management
4. Move heavy document processing off the browser and to backend workers
5. Introduce proper API validation and error handling

### Priority 2 - Required for scale
6. Add file upload workflow using pre-signed URLs and object storage
7. Add queue-based background jobs for redaction/processing
8. Add caching for frequently accessed content
9. Add load testing and performance benchmarks for 1,000 users
10. Add monitoring, logging, and alerts

### Priority 3 - Recommended for production readiness
11. Set up CI/CD pipelines
12. Add infrastructure as code for AWS
13. Add automated tests for auth, upload, document access, and redaction flows
14. Add disaster recovery and backup strategy for documents and metadata

## 6. Recommended AWS Deployment Architecture

### Option A: Best for scale and separation
- Frontend: AWS Amplify Hosting
- Backend: AWS App Runner or ECS Fargate
- File storage: Amazon S3
- CDN: CloudFront
- Queue: SQS or Amazon MQ depending on processing needs
- Database: managed Postgres or Supabase managed DB with connection pooling
- Secrets: AWS Secrets Manager
- Monitoring: CloudWatch + alarms

### Option B: Simpler but less flexible
- Frontend and backend both run on App Runner or ECS
- Use a single domain with API gateway routing
- Still keep frontend/backend separate in code and deployment

## 7. Recommended Delivery Strategy

To avoid a risky big-bang migration:
1. Keep the current app as a reference
2. Create a new frontend repo/branch for the UI
3. Create a new backend repo/branch for APIs and document workflows
4. Move authentication and document processing into the backend first
5. Connect the frontend to the new backend gradually
6. Deploy to AWS only after the new architecture is verified

## 8. Final Recommendation

The project is not yet production-safe or scale-ready for 1,000 concurrent users. The biggest structural change is to separate the frontend and backend and move heavy processing to backend services.

If this project is meant for enterprise use, the next step should be:
- architecture redesign
- deployment planning for AWS
- repo/branch split
- production hardening
