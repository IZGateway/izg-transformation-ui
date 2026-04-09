# Release Notes

## Release v0.14.1

- Update dependencies and base Docker image

## Release v0.14.0

- IGDD-2514 setup nightly / daily builds
- IGDD-2594 update dependency update workflow to use @izgateway/dependency-scripts
- IGDD-2660 bind version bump in base image
- IGDD-2661 libpng version bump in base image

## Release v0.13.1

- Dependency version update

## Release v0.13.0

- IGDD-2557 - Remove next-swagger-doc and swagger-ui-react dependencies as they are not needed
- Add RELEASE_NOTES.md file

## Release v0.12.1
This is a patch release for izg-transformation-ui.
NOTE: When izg-transformation-ui fails over from East to West, or West to East, a logged in user may need to re-authenticate due to the fail-over.

## Release v0.12.0

* Sync release back to dev by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/107
* Sync develop for Release 0.11.1 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/110
* chore(deps): bump lodash from 4.17.21 to 4.17.23 by @dependabot[bot] in https://github.com/IZGateway/izg-transformation-ui/pull/108
* [IGDD-2493](https://izgateway.atlassian.net/browse/IGDD-2493) - chore: update base image to use our base image: alpine-node-openssl-fips by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/113
* [IGDD-2489](https://izgateway.atlassian.net/browse/IGDD-2489): upgrade nextjs version to 16 by @palakpatel311 in https://github.com/IZGateway/izg-transformation-ui/pull/112
* chore(deps): bump qs from 6.14.1 to 6.14.2 by @dependabot[bot] in https://github.com/IZGateway/izg-transformation-ui/pull/115
* [IGDD-2528](https://izgateway.atlassian.net/browse/IGDD-2528)- Upgrade axios by @palakpatel311 in https://github.com/IZGateway/izg-transformation-ui/pull/116
* Release/0.12.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/117


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.11.1...v0.12.0

---


## Release v0.11.1

* Release 0.11.1 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/109

This was a maintenance release to build from the latest IZG base image. 


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.11.0...v0.11.1

---


## Release v0.11.0

* chore(deps): bump validator from 13.15.0 to 13.15.20 by @dependabot[bot] in https://github.com/IZGateway/izg-transformation-ui/pull/90
* chore(deps): bump next-auth from 4.24.11 to 4.24.12 by @dependabot[bot] in https://github.com/IZGateway/izg-transformation-ui/pull/91
* [IGDD-2365](https://izgateway.atlassian.net/browse/IGDD-2365) - Bump node-forge for dependency check finding by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/94
* Release 0.10.2 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/95
* Bump next via npm install next@15.5.7 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/96
* Bump version for hotfix 0.10.3. by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/99
* Update next version to 15.5.7 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/100
* Sync 0.10.3 and 0.10.4 hotfix back to develop by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/101
* Update next version to 15.5.9 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/98
* [IGDD-2343](https://izgateway.atlassian.net/browse/IGDD-2343) - add js-yaml override for mitigation by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/102
* [IGDD-2432](https://izgateway.atlassian.net/browse/IGDD-2432) - Update version of preact to 10.28.2 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/104
* Merge 0.11.0 release into main by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/106


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.10.1...v0.11.0

---


## Release v0.10.4

* Update next version to 15.5.7 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/100


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.10.3...v0.10.4

---


## Release v0.10.3

* Bump version for hotfix 0.10.3. by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/99

This release was needed to deploy an updated image using updated IZG Base Image


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.10.2...v0.10.3

---


## Release v0.10.2

* Release 0.10.2 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/95

This was a hotfix to just pull in updated IZG Base Docker Image.


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.10.1...v0.10.2

---


## Release v0.10.1

* Release 0.10.1 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/89


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.10.0...v0.10.1

---


## Release v0.10.0

* [IGDD-2226](https://izgateway.atlassian.net/browse/IGDD-2226) - Fix tag for images pushed to APHL by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/85
* Sync main & develop to prepare for release. by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/86
* Release 0.10.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/87


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.9.0...v0.10.0

---


## Release v0.9.0

* [IGDD-2181](https://izgateway.atlassian.net/browse/IGDD-2181) - Update to push image to APHL with new requested naming by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/76
* [IGDD-2189](https://izgateway.atlassian.net/browse/IGDD-2189) - Update sha.js with override to version w/o vulnerability by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/78
* Bump version to 0.9.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/80
* [IGDD-2207](https://izgateway.atlassian.net/browse/IGDD-2207) - Update next to 15.5.2 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/81
* Release 0.9.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/82
* Release 0.9.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/83


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.8.0...v0.9.0

---


## Release v0.8.0

* [IGDD-2157](https://izgateway.atlassian.net/browse/IGDD-2157) - Update GitHub Action to deploy ECS tasks in multiple environments by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/72
* fix: Update deploy to develop on pull request instead of PR merge by @palakpatel311 in https://github.com/IZGateway/izg-transformation-ui/pull/71
* chore(deps): bump form-data from 4.0.2 to 4.0.4 by @dependabot[bot] in https://github.com/IZGateway/izg-transformation-ui/pull/70
* chore(deps): bump tmp from 0.2.3 to 0.2.5 by @dependabot[bot] in https://github.com/IZGateway/izg-transformation-ui/pull/73
* Bump version to 0.8.0 for this week's deployment by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/74
* Release 0.8.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/75


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.7.0...v0.8.0

---


## Release v0.7.0

* [IGDD-1991](https://izgateway.atlassian.net/browse/IGDD-1991) - Solution creation no longer generates id  by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/66
* Hotfix 0.6.1 rebase by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/67


**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.6.1...v0.7.0

---


## Release v0.6.1


* Release 0.6.1 - feat: add jwt flag to send token to service (#64) by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/65

**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/commits/v0.6.1

---


## Release v0.6.0


- **[IGDD-1420](https://izgateway.atlassian.net/browse/IGDD-1420)** - Verified session timeout occurs, no change needed.
- **[IGDD-1615](https://izgateway.atlassian.net/browse/IGDD-1615)** - Add nginx to docker to handle HTTPS traffic (https://github.com/IZGateway/izg-transformation-ui/pull/56)
- **[IGDD-1879](https://izgateway.atlassian.net/browse/IGDD-1879)**: Fix for adding Solution to pipeline w/o existing solutions  (https://github.com/IZGateway/izg-transformation-ui/pull/61)
* **[IGDD-1961](https://izgateway.atlassian.net/browse/IGDD-1961)** - Address dependabots by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/48
* **[IGDD-1900](https://izgateway.atlassian.net/browse/IGDD-1900)** - Solution creator (UI) (https://github.com/IZGateway/izg-transformation-ui/pull/54, https://github.com/IZGateway/izg-transformation-ui/pull/55, https://github.com/IZGateway/izg-transformation-ui/pull/57, https://github.com/IZGateway/izg-transformation-ui/pull/58, https://github.com/IZGateway/izg-transformation-ui/pull/59)
* **[IGDD-1969](https://izgateway.atlassian.net/browse/IGDD-1969)** - fix: removed filebeats installation from Dockerfile (https://github.com/IZGateway/izg-transformation-ui/pull/60)


---


## Release v0.5.1


* NextJS bump up to 15.2.4
* Update Filebeats version in Dockerfile
* swagger-ui-react and prismjs bump for vulnerabilities

**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.5.0...v0.5.1

---


## Release v0.5.0

* [IGDD-1814](https://izgateway.atlassian.net/browse/IGDD-1814) Slide Out Animation for Solution Drawer by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/24
* [IGDD-1898](https://izgateway.atlassian.net/browse/IGDD-1898) - CVE-2024-47831 mitigatioin by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/30
* [IGDD-1814](https://izgateway.atlassian.net/browse/IGDD-1814) Animate Drawer by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/31
* [IGDD-1890](https://izgateway.atlassian.net/browse/IGDD-1890) Add version footer to application by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/32
* [IGDD-1880](https://izgateway.atlassian.net/browse/IGDD-1880)-Fix-Apply-ButtomBar by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/35
* [IGDD-1877](https://izgateway.atlassian.net/browse/IGDD-1877) Change configuration for Pipeline Description  by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/38
* [IGDD-1920](https://izgateway.atlassian.net/browse/IGDD-1920) - NextJS 15 upgrade by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/41
* Update version to 0.5.0 in package.json. by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/42

## New Contributors
* @mattystank made their first contribution in https://github.com/IZGateway/izg-transformation-ui/pull/24

**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.4.0...v0.5.0

---


## Release v0.4.0

* [IGDD-1898](https://izgateway.atlassian.net/browse/IGDD-1898) - CVE-2024-47831 mitigatioin by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/30
* [IGDD-1814](https://izgateway.atlassian.net/browse/IGDD-1814) Animate Drawer by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/31
* [IGDD-1890](https://izgateway.atlassian.net/browse/IGDD-1890) Add version footer to application by @mattystank in https://github.com/IZGateway/izg-transformation-ui/pull/32
* [IGDD-1704](https://izgateway.atlassian.net/browse/IGDD-1704) Request for Audit Logging for End User Activites in Transform Services UI

## New Contributors
* @mattystank made their first contribution in https://github.com/IZGateway/izg-transformation-ui/pull/24

**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.3.0...v0.4.0

---


## Release v0.3.0

* [IGDD-1718](https://izgateway.atlassian.net/browse/IGDD-1718) - Move Xform Console to new DNS dev.xform-ui.izgateway.org by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/20
* Update pipeline data correctly by @bradley-w in https://github.com/IZGateway/izg-transformation-ui/pull/19
* [IGDD-1703](https://izgateway.atlassian.net/browse/IGDD-1703) - Modifying log message to state 'xform console' instead of 'config conGǪ by @pcahillai in https://github.com/IZGateway/izg-transformation-ui/pull/22
* [IGDD-1701](https://izgateway.atlassian.net/browse/IGDD-1701) health check by @pcahillai in https://github.com/IZGateway/izg-transformation-ui/pull/23
* chore(deps-dev): bump micromatch from 4.0.7 to 4.0.8 by @dependabot in https://github.com/IZGateway/izg-transformation-ui/pull/7
* chore(deps): bump zod and next by @dependabot in https://github.com/IZGateway/izg-transformation-ui/pull/3
* chore(deps): bump postcss and next by @dependabot in https://github.com/IZGateway/izg-transformation-ui/pull/4
* chore(deps): bump semver and nodemon by @dependabot in https://github.com/IZGateway/izg-transformation-ui/pull/2
* [IGDD-1868](https://izgateway.atlassian.net/browse/IGDD-1868) Xform Console - Added improvements to run locally with docker by @pcahillai in https://github.com/IZGateway/izg-transformation-ui/pull/25
* [IGDD-1417](https://izgateway.atlassian.net/browse/IGDD-1417) - Call Xform Service using access_token (JWT) obtained from Okta by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/26
* Release/0.3.0 by @austinmoody in https://github.com/IZGateway/izg-transformation-ui/pull/27

## New Contributors
* @dependabot made their first contribution in https://github.com/IZGateway/izg-transformation-ui/pull/7

**Full Changelog**: https://github.com/IZGateway/izg-transformation-ui/compare/v0.2.0...v0.3.0

---

