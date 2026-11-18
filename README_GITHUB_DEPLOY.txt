VCE XMAS QUEST - GITHUB PAGES TECHNICAL DEPLOYMENT BUNDLE
Date: 2026-11-18
Purpose: test Deployment Environment on GitHub Pages. NOT a new production freeze.

AUTHORITATIVE RUNTIME ARTIFACTS
- /gmc/index.html = GMC C48 ACTIVITY READ-ONLY VIEW
- /index.html = WebApp C44/C24 ENTER CHALLENGE ROOM CTA
- /live/index.html = Battle Live Screen Candidate 01, TECHNICAL ENDPOINT ONLY, NOT FUNCTIONALLY PROMOTED

IMPORTANT BEFORE PUSH
1. Edit /gmc/deployment.environments.js.
2. Replace exactly: https://CONFIGURE.example/repository/
   with your real GitHub Pages repository base URL, ending with '/'.
   Example shape only: https://<account>.github.io/<repository>/
3. Do not modify the paths:
   webapp=index.html
   gmc=gmc/index.html
   liveScreen=live/index.html
4. Publish the repository root with GitHub Pages.
5. First verify the three HTTPS endpoints manually.
6. Then in GMC Deployment Environment run TEST on GITHUB_PAGES before SET ACTIVE.
7. Keep Firebase Runtime Monitor v3.8.6 local during this test.

URL PARAMETERS AFTER DEPLOY
GMC:  /gmc/index.html?battle=test_vce_xmas_quest
WebApp: /index.html?battle=test_vce_xmas_quest&team=alpha
Live technical endpoint: /live/index.html (Battle ID is entered in its UI)

SECURITY
firebase.environments.js contains Firebase client configuration. Firebase documents these keys as public-by-design when restricted to Firebase services; database authorization must rely on Firebase Security Rules / IAM / App Check as applicable.
Do not publish this bundle publicly until the Firebase public-hosting compatibility/security-rules gate is accepted.

LIVE SCREEN STATUS
Candidate 01 is included only because deployment.environments.js testProfile requires a liveScreen endpoint. Its pending gameplay capabilities are not promoted by this bundle.
