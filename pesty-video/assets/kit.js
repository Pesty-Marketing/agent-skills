/* ==========================================================================
   Pesty Explainer Video — kit.js  (v1)
   Brand tokens, icons, app-UI primitives and motion-graphic building blocks.
   Load after engine.js. Everything is on window.KIT.

   Every component is a pure function of the props you pass (T and times).
   Most accept `k` = a registry key, so the camera / spotlight / callouts /
   cursor can aim at it:  <K.Button k="hs.save">Save</K.Button>
   ========================================================================== */
(function () {
  'use strict';
  const React = window.React, EV = window.EV;
  if (!EV) { console.error('[KIT] Load engine.js before kit.js'); return; }
  const h = React.createElement;
  const { M, Easing, ramp, clamp, reg } = EV;
  const R = (k, r) => (k ? reg(k) : r);

  // ------------------------------------------------------------------------
  // Brand tokens (Pesty Marketing design system)
  // ------------------------------------------------------------------------
  const C = {
    ink: '#002330', ink950: '#00161E', ink800: '#06303D', ink700: '#103F4C', ink600: '#1E5160', ink500: '#356676',
    teal400: '#4F8494', teal300: '#84AEBB', teal200: '#BFD6DD', teal100: '#E4EEF1',
    n0: '#FFFFFF', n25: '#FBFCFC', n50: '#F6F8F9', n100: '#EDF0F2', n200: '#DDE3E6', n300: '#C3CBD0', n400: '#98A4AB',
    muted: '#6C7A82', n600: '#4E5B62', body: '#364248', n800: '#212B30',
    brand: '#D90429', red600: '#BA0322', red700: '#97041F', red50: '#FEF2F3', red100: '#FDE3E5', red200: '#FAC5CB', pink: '#FF5C78',
    succ: '#167349', succ500: '#1F8A5B', succBg: '#DCF3E7', warn: '#C0850B', warn500: '#E8A317', warnBg: '#FCEFCE',
  };
  const F = {
    head: "Epilogue, 'Segoe UI', system-ui, sans-serif",
    body: 'Montserrat, system-ui, -apple-system, sans-serif',
    mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
  };
  const LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTEiIGhlaWdodD0iNzMiIHZpZXdCb3g9IjAgMCAxOTEgNzMiIGZpbGw9Im5vbmUiPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMjUyXzE1NzI2KSI+PHBhdGggZD0iTTY1LjE2IDE0Ljc4MTlDNjEuMzUxMyAxNCA1Ny4xNzI3IDE1LjM5OTkgNTMuNDczMyAxNy4yNDk2TDUzLjQyMjkgMjAuMDQ1MkM1Ni44NjU4IDE4LjE1NzYgNjAuOTg5OCAxNi40NTA5IDY0LjU1ODkgMTcuMTc4MUM2Ni4xMzExIDE3LjUxMDIgNjYuNzQ0OSAxNS4xMTQgNjUuMTYgMTQuNzgxOVoiIGZpbGw9IiNEOTA0MjkiPjwvcGF0aD48cGF0aCBkPSJNNDIuODM3NiAxNC4xNjhMNDUuMjA4NiAxMi42MTI2QzQ0Ljg4OTEgOC40NzYwMSA0My45MjIyIDQuMTYyODUgNDEuMjgyMiAxLjI5NTgzQzQwLjIwMTggMC4xMjI5NTEgMzguNDYxNCAxLjg4MDE2IDM5LjUzNzYgMy4wNDg4M0M0Mi4wMzg5IDUuNzUxOTEgNDIuNjg2MiAxMC4yMjA2IDQyLjgzNzYgMTQuMTY4WiIgZmlsbD0iI0Q5MDQyOSI+PC9wYXRoPjxwYXRoIGQ9Ik0zNy4wMTU2IDU3LjQ4NTVDNDEuMjgyNSA2Mi41OTc0IDQ4LjMwNzIgNzAuOTk2NyA0OS4wMDA4IDcxLjgyOUM1MC40MjE3IDczLjUxMDYgNTEuOTcyOSA3My4wNDgxIDUxLjk0MzUgNzAuNDg4QzUxLjk0MzUgNjkuOTc5MyA1MS45NDM1IDU4LjIyOTUgNTEuOTQzNSA0Ny41NTE4QzQ2LjUwNzkgNTEuMTcxMyA0MS4xNDM4IDU0Ljc0MDQgMzcuMDE1NiA1Ny40ODU1WiIgZmlsbD0iI0Q5MDQyOSI+PC9wYXRoPjxwYXRoIGQ9Ik0xLjkwNDQ1IDQ2LjU2NzRMMjAuNDg1NSA0OC42MTg5QzIwLjQ4NTUgNDMuNjU4NCAyMC40ODU1IDM3LjIxODEgMjAuNDg1NSAzMC42Njg1QzExLjU5ODUgMzYuNTgzMyAxLjgxNjE3IDQzLjA4NjYgMS4zODczOCA0My4zNjgzQy0wLjc1MjM4NiA0NC43NjQgLTAuMjg5OTYxIDQ2LjMxMSAxLjkwNDQ1IDQ2LjU2NzRaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PHBhdGggZD0iTTUxLjk3MjkgMTUuNTEzNUM1MS45NzI5IDEzLjcxNDIgNTEuNTEwNSAxMi42MDAyIDUwLjcxMTcgMTIuMTE2OEM0OS44NzEgMTEuNjk2NCA0OC42ODEzIDExLjk0NDQgNDcuMTgwNSAxMi45NTc1TDIzLjIzNTQgMjguODUyM0MyMy4yMzU0IDQxLjA0MzUgMjMuMjM1NCA1My42NTUxIDIzLjIzNTQgNTcuNTk4M0MyMy4yMzU0IDU5LjQwMTcgMjMuNjk3OCA2MC41MTU4IDI0LjQ5NjUgNjAuOTk1QzI1LjMzNzMgNjEuNDE1NCAyNi41MjcgNjEuMTcxNiAyOC4wMjc3IDYwLjE1NDJDMzEuMzI3OCA1Ny45NjQgNDEuNzk5NiA1MC45OTQgNTEuOTY4NyA0NC4yNDI2QzUxLjk2NDUgMzIuMDU1NyA1MS45NzI5IDE5LjQ3MzUgNTEuOTcyOSAxNS41MTM1WiIgZmlsbD0iI0Q5MDQyOSI+PC9wYXRoPjxwYXRoIGQ9Ik05OC40MzczIDM5LjI1MzFDOTguNDM3MyA0Ni4zMTk4IDkzLjUzOTggNTEuMDIzOSA4Ni44MTc4IDUxLjAyMzlDODMuNTY0MSA1MS4wMjM5IDgwLjcwNTQgNDkuNzYyOCA3OC43OTY5IDQ3LjI5NTFWNTkuMTc1Mkg3NC42MzA5VjI3Ljc2NEg3OC42MTE5VjMxLjQwNDVDODAuNDc4NCAyOC44NDg2IDgzLjQyNTMgMjcuNTQ1NCA4Ni44MDk0IDI3LjU0NTRDOTMuNTM5OCAyNy41NDU0IDk4LjQzNzMgMzIuMjI4NSA5OC40MzczIDM5LjI1MzFaTTk0LjIzMzQgMzkuMjUzMUM5NC4yMzM0IDM0LjM5MzUgOTAuODk1NiAzMS4xODU5IDg2LjQ2ODkgMzEuMTg1OUM4Mi4wNDIzIDMxLjE4NTkgNzguNzUwNiAzNC4zOTM1IDc4Ljc1MDYgMzkuMjUzMUM3OC43NTA2IDQ0LjExMjggODIuMDg4NSA0Ny4zNjI0IDg2LjQ2ODkgNDcuMzYyNEM5MC44NDkzIDQ3LjM2MjQgOTQuMjMzNCA0NC4xNTA2IDk0LjIzMzQgMzkuMjUzMVoiIGZpbGw9IiMwMDIzMzAiPjwvcGF0aD48cGF0aCBkPSJNMTI0Ljg4OCA0MC42Mzk2SDEwNi4yNEMxMDYuNzYxIDQ0LjY3MTEgMTEwLjAyMyA0Ny4zNjU4IDExNC41NjggNDcuMzY1OEMxMTcuMjU0IDQ3LjM2NTggMTE5LjUwNyA0Ni40NTM2IDEyMS4yMDEgNDQuNTkxM0wxMjMuNTAxIDQ3LjI3NzVDMTIxLjQyIDQ5LjcwNzMgMTE4LjI1IDUxLjAwNjMgMTE0LjQzNyA1MS4wMDYzQzEwNy4wMjIgNTEuMDA2MyAxMDIuMDc4IDQ2LjEwODggMTAyLjA3OCAzOS4yNTY2QzEwMi4wNzggMzIuNDA0MyAxMDYuOTggMjcuNTQ4OCAxMTMuNjE0IDI3LjU0ODhDMTIwLjI0NyAyNy41NDg4IDEyNC45NjQgMzIuMzIwMiAxMjQuOTY0IDM5LjM4NjlDMTI0Ljk3MiAzOS43Mjc0IDEyNC45MyA0MC4yNDg3IDEyNC44ODggNDAuNjM5NlpNMTA2LjI0IDM3LjY0NjVIMTIwLjk4M0MxMjAuNTYyIDMzLjc4NzMgMTE3LjY0NSAzMS4wNTQ4IDExMy42MTQgMzEuMDU0OEMxMDkuNTgyIDMxLjA1NDggMTA2LjY3NyAzMy43NDUzIDEwNi4yNCAzNy42NDY1WiIgZmlsbD0iIzAwMjMzMCI+PC9wYXRoPjxwYXRoIGQ9Ik0xMjcuODM1IDQ4LjMxNzFMMTI5LjU2NyA0NS4wMjEzQzEzMS41MTggNDYuNDA4NiAxMzQuNjQxIDQ3LjQwNDkgMTM3LjYzNCA0Ny40MDQ5QzE0MS40OTMgNDcuNDA0OSAxNDMuMDk5IDQ2LjIzNjIgMTQzLjA5OSA0NC4yODU2QzE0My4wOTkgMzkuMTIzMyAxMjguNTc1IDQzLjU5MiAxMjguNTc1IDM0LjQ0MDJDMTI4LjU3NSAzMC4zMjA0IDEzMi4yNjIgMjcuNTQ1OSAxMzguMTYgMjcuNTQ1OUMxNDEuMTQ5IDI3LjU0NTkgMTQ0LjUzMyAyOC4zMjc4IDE0Ni41MjkgMjkuNjQ3OEwxNDQuNzUxIDMyLjk0MzZDMTQyLjc2NCAzMS43MDE2IDE0MC40NTYgMzEuMDY4OCAxMzguMTEzIDMxLjEyMzRDMTM0LjQ3MyAzMS4xMjM0IDEzMi42OTUgMzIuNDY4NiAxMzIuNjk1IDM0LjI4ODlDMTMyLjY5NSAzOS43MDc2IDE0Ny4yNjUgMzUuMjg1MiAxNDcuMjY1IDQ0LjIxODRDMTQ3LjI2NSA0OC4zODAyIDE0My40NDggNTEuMDI0NCAxMzcuMzM2IDUxLjAyNDRDMTMzLjUxNCA1MS4wMDM0IDEyOS43MzkgNDkuODM0NyAxMjcuODM1IDQ4LjMxNzFaIiBmaWxsPSIjMDAyMzMwIj48L3BhdGg+PHBhdGggZD0iTTE2NS4zODMgNDkuNDAxNkMxNjQuMTIyIDUwLjQ4NjIgMTYyLjIxOCA1MS4wMDMzIDE2MC4zMzkgNTEuMDAzM0MxNTUuNzE1IDUxLjAwMzMgMTUzLjA1NCA0OC40NDMxIDE1My4wNTQgNDMuODA2M1YzMS4xNzc5SDE0OS4xNTJWMjcuNzY0NEgxNTMuMDU0VjIyLjcxOTdIMTU3LjIyNFYyNy43NjQ0SDE2My44MjRWMzEuMTc3OUgxNTcuMjI0VjQzLjYyNTVDMTU3LjIyNCA0Ni4wOTc0IDE1OC41MjMgNDcuNDg0NiAxNjAuODIyIDQ3LjQ4NDZDMTYxLjk5OCA0Ny40OTcyIDE2My4xNDMgNDcuMTE1MyAxNjQuMDc2IDQ2LjRMMTY1LjM4MyA0OS40MDE2WiIgZmlsbD0iIzAwMjMzMCI+PC9wYXRoPjxwYXRoIGQ9Ik0xOTAuMzE3IDI3Ljc2MzdMMTc5LjE3MyA1My4wMzcyQzE3Ny4xMzQgNTcuODkyNyAxNzQuNDkgNTkuNDEwMyAxNzAuOTc1IDU5LjQxMDNDMTY4Ljc2NCA1OS40MTAzIDE2Ni41MTEgNTguNjc0NiAxNjUuMDkgNTcuMzA4NEwxNjYuODY4IDU0LjE4NDlDMTY3Ljk2OCA1NS4yNjMgMTY5LjQ0NyA1NS44NjY3IDE3MC45ODggNTUuODY2NEMxNzIuOTg1IDU1Ljg2NjQgMTc0LjI0MiA1NC45NTQyIDE3NS4zNjggNTIuMzFMMTc2LjEwNCA1MC43MDQxTDE2NS45NDcgMjcuNzYzN0gxNzAuMjgyTDE3OC4zMDcgNDYuMTQ3MUwxODYuMjMxIDI3Ljc2MzdIMTkwLjMxN1oiIGZpbGw9IiMwMDIzMzAiPjwvcGF0aD48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwMF8xMjUyXzE1NzI2Ij48cmVjdCB3aWR0aD0iMTkwLjMxNyIgaGVpZ2h0PSI3MS45MTUzIiBmaWxsPSIjMDAyMzMwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDAuOTA5MTgpIj48L3JlY3Q+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+';
  const LOGO_WHITE = 'data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTkxIiBoZWlnaHQ9IjczIiB2aWV3Qm94PSIwIDAgMTkxIDczIiBmaWxsPSJub25lIj48ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTI1Ml8xNTcyNikiIGZpbGw9IiNEOTA0MjkiPjxwYXRoIGQ9Ik02NS4xNiAxNC43ODE5QzYxLjM1MTMgMTQgNTcuMTcyNyAxNS4zOTk5IDUzLjQ3MzMgMTcuMjQ5Nkw1My40MjI5IDIwLjA0NTJDNTYuODY1OCAxOC4xNTc2IDYwLjk4OTggMTYuNDUwOSA2NC41NTg5IDE3LjE3ODFDNjYuMTMxMSAxNy41MTAyIDY2Ljc0NDkgMTUuMTE0IDY1LjE2IDE0Ljc4MTlaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PHBhdGggZD0iTTQyLjgzNzYgMTQuMTY4TDQ1LjIwODYgMTIuNjEyNkM0NC44ODkxIDguNDc2MDEgNDMuOTIyMiA0LjE2Mjg1IDQxLjI4MjIgMS4yOTU4M0M0MC4yMDE4IDAuMTIyOTUxIDM4LjQ2MTQgMS44ODAxNiAzOS41Mzc2IDMuMDQ4ODNDNDIuMDM4OSA1Ljc1MTkxIDQyLjY4NjIgMTAuMjIwNiA0Mi44Mzc2IDE0LjE2OFoiIGZpbGw9IiNEOTA0MjkiPjwvcGF0aD48cGF0aCBkPSJNMzcuMDE1NiA1Ny40ODU1QzQxLjI4MjUgNjIuNTk3NCA0OC4zMDcyIDcwLjk5NjcgNDkuMDAwOCA3MS44MjlDNTAuNDIxNyA3My41MTA2IDUxLjk3MjkgNzMuMDQ4MSA1MS45NDM1IDcwLjQ4OEM1MS45NDM1IDY5Ljk3OTMgNTEuOTQzNSA1OC4yMjk1IDUxLjk0MzUgNDcuNTUxOEM0Ni41MDc5IDUxLjE3MTMgNDEuMTQzOCA1NC43NDA0IDM3LjAxNTYgNTcuNDg1NVoiIGZpbGw9IiNEOTA0MjkiPjwvcGF0aD48cGF0aCBkPSJNMS45MDQ0NSA0Ni41Njc0TDIwLjQ4NTUgNDguNjE4OUMyMC40ODU1IDQzLjY1ODQgMjAuNDg1NSAzNy4yMTgxIDIwLjQ4NTUgMzAuNjY4NUMxMS41OTg1IDM2LjU4MzMgMS44MTYxNyA0My4wODY2IDEuMzg3MzggNDMuMzY4M0MtMC43NTIzODYgNDQuNzY0IC0wLjI4OTk2MSA0Ni4zMTEgMS45MDQ0NSA0Ni41Njc0WiIgZmlsbD0iI0Q5MDQyOSI+PC9wYXRoPjxwYXRoIGQ9Ik01MS45NzI5IDE1LjUxMzVDNTEuOTcyOSAxMy43MTQyIDUxLjUxMDUgMTIuNjAwMiA1MC43MTE3IDEyLjExNjhDNDkuODcxIDExLjY5NjQgNDguNjgxMyAxMS45NDQ0IDQ3LjE4MDUgMTIuOTU3NUwyMy4yMzU0IDI4Ljg1MjNDMjMuMjM1NCA0MS4wNDM1IDIzLjIzNTQgNTMuNjU1MSAyMy4yMzU0IDU3LjU5ODNDMjMuMjM1NCA1OS40MDE3IDIzLjY5NzggNjAuNTE1OCAyNC40OTY1IDYwLjk5NUMyNS4zMzczIDYxLjQxNTQgMjYuNTI3IDYxLjE3MTYgMjguMDI3NyA2MC4xNTQyQzMxLjMyNzggNTcuOTY0IDQxLjc5OTYgNTAuOTk0IDUxLjk2ODcgNDQuMjQyNkM1MS45NjQ1IDMyLjA1NTcgNTEuOTcyOSAxOS40NzM1IDUxLjk3MjkgMTUuNTEzNVoiIGZpbGw9IiNEOTA0MjkiPjwvcGF0aD48cGF0aCBkPSJNOTguNDM3MyAzOS4yNTMxQzk4LjQzNzMgNDYuMzE5OCA5My41Mzk4IDUxLjAyMzkgODYuODE3OCA1MS4wMjM5QzgzLjU2NDEgNTEuMDIzOSA4MC43MDU0IDQ5Ljc2MjggNzguNzk2OSA0Ny4yOTUxVjU5LjE3NTJINzQuNjMwOVYyNy43NjRINzguNjExOVYzMS40MDQ1QzgwLjQ3ODQgMjguODQ4NiA4My40MjUzIDI3LjU0NTQgODYuODA5NCAyNy41NDU0QzkzLjUzOTggMjcuNTQ1NCA5OC40MzczIDMyLjIyODUgOTguNDM3MyAzOS4yNTMxWk05NC4yMzM0IDM5LjI1MzFDOTQuMjMzNCAzNC4zOTM1IDkwLjg5NTYgMzEuMTg1OSA4Ni40Njg5IDMxLjE4NTlDODIuMDQyMyAzMS4xODU5IDc4Ljc1MDYgMzQuMzkzNSA3OC43NTA2IDM5LjI1MzFDNzguNzUwNiA0NC4xMTI4IDgyLjA4ODUgNDcuMzYyNCA4Ni40Njg5IDQ3LjM2MjRDOTAuODQ5MyA0Ny4zNjI0IDk0LjIzMzQgNDQuMTUwNiA5NC4yMzM0IDM5LjI1MzFaIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+PHBhdGggZD0iTTEyNC44ODggNDAuNjM5NkgxMDYuMjRDMTA2Ljc2MSA0NC42NzExIDExMC4wMjMgNDcuMzY1OCAxMTQuNTY4IDQ3LjM2NThDMTE3LjI1NCA0Ny4zNjU4IDExOS41MDcgNDYuNDUzNiAxMjEuMjAxIDQ0LjU5MTNMMTIzLjUwMSA0Ny4yNzc1QzEyMS40MiA0OS43MDczIDExOC4yNSA1MS4wMDYzIDExNC40MzcgNTEuMDA2M0MxMDcuMDIyIDUxLjAwNjMgMTAyLjA3OCA0Ni4xMDg4IDEwMi4wNzggMzkuMjU2NkMxMDIuMDc4IDMyLjQwNDMgMTA2Ljk4IDI3LjU0ODggMTEzLjYxNCAyNy41NDg4QzEyMC4yNDcgMjcuNTQ4OCAxMjQuOTY0IDMyLjMyMDIgMTI0Ljk2NCAzOS4zODY5QzEyNC45NzIgMzkuNzI3NCAxMjQuOTMgNDAuMjQ4NyAxMjQuODg4IDQwLjYzOTZaTTEwNi4yNCAzNy42NDY1SDEyMC45ODNDMTIwLjU2MiAzMy43ODczIDExNy42NDUgMzEuMDU0OCAxMTMuNjE0IDMxLjA1NDhDMTA5LjU4MiAzMS4wNTQ4IDEwNi42NzcgMzMuNzQ1MyAxMDYuMjQgMzcuNjQ2NVoiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD48cGF0aCBkPSJNMTI3LjgzNSA0OC4zMTcxTDEyOS41NjcgNDUuMDIxM0MxMzEuNTE4IDQ2LjQwODYgMTM0LjY0MSA0Ny40MDQ5IDEzNy42MzQgNDcuNDA0OUMxNDEuNDkzIDQ3LjQwNDkgMTQzLjA5OSA0Ni4yMzYyIDE0My4wOTkgNDQuMjg1NkMxNDMuMDk5IDM5LjEyMzMgMTI4LjU3NSA0My41OTIgMTI4LjU3NSAzNC40NDAyQzEyOC41NzUgMzAuMzIwNCAxMzIuMjYyIDI3LjU0NTkgMTM4LjE2IDI3LjU0NTlDMTQxLjE0OSAyNy41NDU5IDE0NC41MzMgMjguMzI3OCAxNDYuNTI5IDI5LjY0NzhMMTQ0Ljc1MSAzMi45NDM2QzE0Mi43NjQgMzEuNzAxNiAxNDAuNDU2IDMxLjA2ODggMTM4LjExMyAzMS4xMjM0QzEzNC40NzMgMzEuMTIzNCAxMzIuNjk1IDMyLjQ2ODYgMTMyLjY5NSAzNC4yODg5QzEzMi42OTUgMzkuNzA3NiAxNDcuMjY1IDM1LjI4NTIgMTQ3LjI2NSA0NC4yMTg0QzE0Ny4yNjUgNDguMzgwMiAxNDMuNDQ4IDUxLjAyNDQgMTM3LjMzNiA1MS4wMjQ0QzEzMy41MTQgNTEuMDAzNCAxMjkuNzM5IDQ5LjgzNDcgMTI3LjgzNSA0OC4zMTcxWiIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPjxwYXRoIGQ9Ik0xNjUuMzgzIDQ5LjQwMTZDMTY0LjEyMiA1MC40ODYyIDE2Mi4yMTggNTEuMDAzMyAxNjAuMzM5IDUxLjAwMzNDMTU1LjcxNSA1MS4wMDMzIDE1My4wNTQgNDguNDQzMSAxNTMuMDU0IDQzLjgwNjNWMzEuMTc3OUgxNDkuMTUyVjI3Ljc2NDRIMTUzLjA1NFYyMi43MTk3SDE1Ny4yMjRWMjcuNzY0NEgxNjMuODI0VjMxLjE3NzlIMTU3LjIyNFY0My42MjU1QzE1Ny4yMjQgNDYuMDk3NCAxNTguNTIzIDQ3LjQ4NDYgMTYwLjgyMiA0Ny40ODQ2QzE2MS45OTggNDcuNDk3MiAxNjMuMTQzIDQ3LjExNTMgMTY0LjA3NiA0Ni40TDE2NS4zODMgNDkuNDAxNloiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD48cGF0aCBkPSJNMTkwLjMxNyAyNy43NjM3TDE3OS4xNzMgNTMuMDM3MkMxNzcuMTM0IDU3Ljg5MjcgMTc0LjQ5IDU5LjQxMDMgMTcwLjk3NSA1OS40MTAzQzE2OC43NjQgNTkuNDEwMyAxNjYuNTExIDU4LjY3NDYgMTY1LjA5IDU3LjMwODRMMTY2Ljg2OCA1NC4xODQ5QzE2Ny45NjggNTUuMjYzIDE2OS40NDcgNTUuODY2NyAxNzAuOTg4IDU1Ljg2NjRDMTcyLjk4NSA1NS44NjY0IDE3NC4yNDIgNTQuOTU0MiAxNzUuMzY4IDUyLjMxTDE3Ni4xMDQgNTAuNzA0MUwxNjUuOTQ3IDI3Ljc2MzdIMTcwLjI4MkwxNzguMzA3IDQ2LjE0NzFMMTg2LjIzMSAyNy43NjM3SDE5MC4zMTdaIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0iY2xpcDBfMTI1Ml8xNTcyNiI+PHJlY3Qgd2lkdGg9IjE5MC4zMTciIGhlaWdodD0iNzEuOTE1MyIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMC45MDkxOCkiPjwvcmVjdD48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4=';
  const MARK = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NiIgaGVpZ2h0PSI3MyIgdmlld0JveD0iMCAwIDY2IDczIiBmaWxsPSJub25lIj48cGF0aCBkPSJNNjUuMTYgMTQuNzgxOUM2MS4zNTEzIDE0IDU3LjE3MjcgMTUuMzk5OSA1My40NzMzIDE3LjI0OTZMNTMuNDIyOSAyMC4wNDUyQzU2Ljg2NTggMTguMTU3NiA2MC45ODk4IDE2LjQ1MDkgNjQuNTU4OSAxNy4xNzgxQzY2LjEzMTEgMTcuNTEwMiA2Ni43NDQ5IDE1LjExNCA2NS4xNiAxNC43ODE5WiIgZmlsbD0iI0Q5MDQyOSI+PC9wYXRoPjxwYXRoIGQ9Ik00Mi44Mzc2IDE0LjE2OEw0NS4yMDg2IDEyLjYxMjZDNDQuODg5MSA4LjQ3NjAxIDQzLjkyMjIgNC4xNjI4NSA0MS4yODIyIDEuMjk1ODNDNDAuMjAxOCAwLjEyMjk1MSAzOC40NjE0IDEuODgwMTYgMzkuNTM3NiAzLjA0ODgzQzQyLjAzODkgNS43NTE5MSA0Mi42ODYyIDEwLjIyMDYgNDIuODM3NiAxNC4xNjhaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PHBhdGggZD0iTTM3LjAxNTYgNTcuNDg1NUM0MS4yODI1IDYyLjU5NzQgNDguMzA3MiA3MC45OTY3IDQ5LjAwMDggNzEuODI5QzUwLjQyMTcgNzMuNTEwNiA1MS45NzI5IDczLjA0ODEgNTEuOTQzNSA3MC40ODhDNTEuOTQzNSA2OS45NzkzIDUxLjk0MzUgNTguMjI5NSA1MS45NDM1IDQ3LjU1MThDNDYuNTA3OSA1MS4xNzEzIDQxLjE0MzggNTQuNzQwNCAzNy4wMTU2IDU3LjQ4NTVaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PHBhdGggZD0iTTEuOTA0NDUgNDYuNTY3NEwyMC40ODU1IDQ4LjYxODlDMjAuNDg1NSA0My42NTg0IDIwLjQ4NTUgMzcuMjE4MSAyMC40ODU1IDMwLjY2ODVDMTEuNTk4NSAzNi41ODMzIDEuODE2MTcgNDMuMDg2NiAxLjM4NzM4IDQzLjM2ODNDLTAuNzUyMzg2IDQ0Ljc2NCAtMC4yODk5NjEgNDYuMzExIDEuOTA0NDUgNDYuNTY3NFoiIGZpbGw9IiNEOTA0MjkiPjwvcGF0aD48cGF0aCBkPSJNNTEuOTcyOSAxNS41MTM1QzUxLjk3MjkgMTMuNzE0MiA1MS41MTA1IDEyLjYwMDIgNTAuNzExNyAxMi4xMTY4QzQ5Ljg3MSAxMS42OTY0IDQ4LjY4MTMgMTEuOTQ0NCA0Ny4xODA1IDEyLjk1NzVMMjMuMjM1NCAyOC44NTIzQzIzLjIzNTQgNDEuMDQzNSAyMy4yMzU0IDUzLjY1NTEgMjMuMjM1NCA1Ny41OTgzQzIzLjIzNTQgNTkuNDAxNyAyMy42OTc4IDYwLjUxNTggMjQuNDk2NSA2MC45OTVDMjUuMzM3MyA2MS40MTU0IDI2LjUyNyA2MS4xNzE2IDI4LjAyNzcgNjAuMTU0MkMzMS4zMjc4IDU3Ljk2NCA0MS43OTk2IDUwLjk5NCA1MS45Njg3IDQ0LjI0MjZDNTEuOTY0NSAzMi4wNTU3IDUxLjk3MjkgMTkuNDczNSA1MS45NzI5IDE1LjUxMzVaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PC9zdmc+';
  const Logo = ({ white, height = 40, style }) => h('img', { src: white ? LOGO_WHITE : LOGO, alt: 'pesty', style: Object.assign({ height, width: 'auto', display: 'block' }, style) });
  const Mark = ({ height = 40, style }) => h('img', { src: MARK, alt: '', style: Object.assign({ height, width: 'auto', display: 'block' }, style) });

  // ------------------------------------------------------------------------
  // Icons (lucide, 24 grid, 2px stroke).  <Ic n="mail" s={20}/>
  // Shorthand: 'R x,y,w,h,rx' rect · 'C cx,cy,r' circle · 'E cx,cy,rx,ry' ellipse
  // ------------------------------------------------------------------------
  const IC = {
    'layout-dashboard': ['R3,3,7,9,1', 'R14,3,7,5,1', 'R14,12,7,9,1', 'R3,16,7,5,1'],
    'user-plus': ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'C9,7,4', 'M19 8v6', 'M22 11h-6'],
    user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'C12,7,4'],
    users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'C9,7,4', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    'clipboard-check': ['R8,2,8,4,1', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'm9 14 2 2 4-4'],
    activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
    mail: ['R2,4,20,16,2', 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
    'message-square': ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
    'message-square-text': ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'M13 8H7', 'M17 12H7'],
    'shield-check': ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'],
    shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'],
    database: ['E12,5,9,3', 'M3 5V19A9 3 0 0 0 21 19V5', 'M3 12A9 3 0 0 0 21 12'],
    gauge: ['m12 14 4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
    plug: ['M12 22v-5', 'M9 8V2', 'M15 8V2', 'M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z'],
    server: ['R2,2,20,8,2', 'R2,14,20,8,2', 'M6 6h.01', 'M6 18h.01'],
    'log-out': ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
    'log-in': ['M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4', 'm10 17 5-5-5-5', 'M15 12H3'],
    'panel-left': ['R3,3,18,18,2', 'M9 3v18'],
    'chevron-right': ['m9 18 6-6-6-6'], 'chevron-down': ['m6 9 6 6 6-6'], 'chevron-left': ['m15 18-6-6 6-6'], 'chevron-up': ['m18 15-6-6-6 6'],
    'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'], 'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
    upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
    lock: ['R3,11,18,11,2', 'M7 11V7a5 5 0 0 1 10 0v4'],
    send: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'],
    'external-link': ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
    link: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
    'rotate-ccw': ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
    'refresh-cw': ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
    x: ['M18 6 6 18', 'm6 6 12 12'], check: ['M20 6 9 17l-5-5'], plus: ['M5 12h14', 'M12 5v14'], minus: ['M5 12h14'],
    search: ['C11,11,8', 'm21 21-4.3-4.3'],
    'scan-search': ['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'C12,12,3', 'm16 16-1.9-1.9'],
    tablet: ['R4,2,16,20,2', 'M12 18h.01'], smartphone: ['R5,2,14,20,2', 'M12 18h.01'], monitor: ['R2,3,20,14,2', 'M8 21h8', 'M12 17v4'],
    'triangle-alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
    info: ['C12,12,10', 'M12 16v-4', 'M12 8h.01'],
    'circle-help': ['C12,12,10', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
    'check-circle': ['C12,12,10', 'm9 12 2 2 4-4'], 'x-circle': ['C12,12,10', 'm15 9-6 6', 'm9 9 6 6'], ban: ['C12,12,10', 'm4.9 4.9 14.2 14.2'],
    globe: ['C12,12,10', 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
    calendar: ['M8 2v4', 'M16 2v4', 'R3,4,18,18,2', 'M3 10h18'],
    clock: ['C12,12,10', 'M12 6v6l4 2'],
    'circle-dollar-sign': ['C12,12,10', 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 18V6'],
    'map-pin': ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z', 'C12,10,3'],
    'trash-2': ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],
    home: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
    'file-text': ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8'],
    folder: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
    eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'C12,12,3'],
    pencil: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 'm15 5 4 4'],
    filter: ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'],
    'bar-chart': ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
    'trending-up': ['m22 7-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
    star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
    bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
    'list-checks': ['m3 17 2 2 4-4', 'm3 7 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8'],
    zap: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
    'book-open': ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'],
    image: ['R3,3,18,18,2', 'C9,9,2', 'm21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21'],
    copy: ['R8,8,14,14,2', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
    'more-horizontal': ['C12,12,1', 'C19,12,1', 'C5,12,1'],
    flag: ['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'],
    target: ['C12,12,10', 'C12,12,6', 'C12,12,2'],
    settings: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'C12,12,3'],
    play: ['M6 3l14 9-14 9V3z'],
  };
  function Ic({ n, s = 16, w = 2, color, style }) {
    const parts = (IC[n] || []).map((d, i) => {
      if (d[0] === 'R') { const [x, y, ww, hh, r] = d.slice(1).split(',').map(Number); return h('rect', { key: i, x, y, width: ww, height: hh, rx: r }); }
      if (d[0] === 'C') { const [cx, cy, r] = d.slice(1).split(',').map(Number); return h('circle', { key: i, cx, cy, r }); }
      if (d[0] === 'E') { const [cx, cy, rx, ry] = d.slice(1).split(',').map(Number); return h('ellipse', { key: i, cx, cy, rx, ry }); }
      return h('path', { key: i, d });
    });
    if (!IC[n]) console.warn('[KIT] unknown icon', n);
    return h('svg', { viewBox: '0 0 24 24', width: s, height: s, fill: 'none', stroke: color || 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', style: Object.assign({ flex: 'none', display: 'block' }, style) }, parts);
  }

  // ------------------------------------------------------------------------
  // App-UI primitives (shadcn-style, Pesty tokens). Authored at real UI size
  // (14px text); the camera layer scales them up for 1080p.
  // ------------------------------------------------------------------------
  function Card({ k, r, sm, style, children }) {
    const sp = sm ? 12 : 16;
    return h('div', { ref: R(k, r), style: Object.assign({ display: 'flex', flexDirection: 'column', gap: sp, overflow: 'hidden', borderRadius: 14, background: C.n0, padding: `${sp}px 0`, fontSize: 14, color: C.ink, boxShadow: '0 0 0 1px rgba(0,35,48,0.1)' }, style) }, children);
  }
  function CardHeader({ k, title, desc, action, border, sm, style }) {
    const sp = sm ? 12 : 16;
    return h('div', { ref: R(k), style: Object.assign({ display: 'flex', alignItems: 'flex-start', gap: 12, padding: `0 ${sp}px` }, border ? { paddingBottom: sp, borderBottom: `1px solid ${C.n200}` } : {}, style) },
      h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 } },
        h('div', { style: { fontFamily: F.head, fontSize: sm ? 14 : 16, lineHeight: 1.375, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 } }, title),
        desc ? h('div', { style: { fontSize: 14, color: C.muted, lineHeight: 1.45 } }, desc) : null),
      action ? h('div', { style: { display: 'flex', gap: 8 } }, action) : null);
  }
  const CardContent = ({ sm, flush, style, children }) => h('div', { style: Object.assign({ padding: flush ? 0 : `0 ${sm ? 12 : 16}px` }, style) }, children);
  const BADGE = {
    default: { background: C.ink, color: '#fff' }, secondary: { background: C.n100, color: C.ink800 }, red: { background: C.red50, color: C.red600 },
    destructive: { background: 'rgba(186,3,34,0.1)', color: C.red600 }, outline: { borderColor: C.n200, color: C.ink },
    success: { background: C.succBg, color: C.succ }, warning: { background: C.warnBg, color: C.warn },
  };
  function Badge({ k, v = 'default', icon, children, style }) {
    return h('span', { ref: R(k), style: Object.assign({ display: 'inline-flex', alignItems: 'center', gap: 4, height: 20, padding: icon ? '2px 8px 2px 6px' : '2px 8px', borderRadius: 999, border: '1px solid transparent', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', flex: 'none' }, BADGE[v], style) },
      icon ? h(Ic, { n: icon, s: 12 }) : null, children);
  }
  const BTN_SIZE = { default: { height: 34, padding: '0 12px', borderRadius: 10, fontSize: 14, gap: 6, icon: 16 }, sm: { height: 28, padding: '0 10px', borderRadius: 8, fontSize: 13, gap: 4, icon: 14 }, lg: { height: 42, padding: '0 18px', borderRadius: 12, fontSize: 16, gap: 8, icon: 18 } };
  const BTN_V = { default: { background: C.ink, color: '#fff' }, brand: { background: C.brand, color: '#fff' }, outline: { background: C.n0, borderColor: C.n200, color: C.ink }, ghost: { background: 'transparent', color: C.ink }, secondary: { background: C.n100, color: C.ink800 } };
  function Button({ k, v = 'default', size = 'default', icon, iconRight, children, pressed, style }) {
    const s = BTN_SIZE[size];
    return h('span', { ref: R(k), style: Object.assign({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', border: '1px solid transparent', fontWeight: 500, whiteSpace: 'nowrap', height: s.height, padding: s.padding, borderRadius: s.borderRadius, fontSize: s.fontSize, gap: s.gap, fontFamily: F.body, transform: pressed ? 'scale(0.96)' : 'none' }, BTN_V[v], style) },
      icon ? h(Ic, { n: icon, s: s.icon }) : null, children, iconRight ? h(Ic, { n: iconRight, s: s.icon }) : null);
  }
  // on: boolean or 0..1 (animate with M.glide)
  function Switch({ k, on = 0 }) {
    const p = typeof on === 'number' ? on : on ? 1 : 0;
    return h('span', { ref: R(k), style: { position: 'relative', display: 'inline-block', flex: 'none', width: 34, height: 20, borderRadius: 999, background: p > 0.5 ? C.ink : C.n300 } },
      h('span', { style: { position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transform: `translateX(${(14 * p).toFixed(2)}px)`, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' } }));
  }
  function Checkbox({ k, on = 0 }) {
    const p = typeof on === 'number' ? on : on ? 1 : 0;
    return h('span', { ref: R(k), style: { width: 18, height: 18, borderRadius: 5, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${p > 0.5 ? C.ink : C.n300}`, background: p > 0.5 ? C.ink : '#fff', color: '#fff' } }, p > 0.5 ? h(Ic, { n: 'check', s: 13, w: 3 }) : null);
  }
  // value: text shown (use EV.typed for typing); caret: show a blinking-free caret
  function Input({ k, value, placeholder, w, mono, caret, focus, icon, style }) {
    return h('div', { ref: R(k), style: Object.assign({ height: 36, borderRadius: 10, border: `1px solid ${focus ? C.ink : C.n200}`, boxShadow: focus ? '0 0 0 3px rgba(0,35,48,0.12)' : 'none', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, width: w, boxSizing: 'border-box', background: '#fff', fontFamily: mono ? F.mono : F.body, color: value ? C.ink : C.n400 }, style) },
      icon ? h(Ic, { n: icon, s: 16, color: C.muted }) : null,
      h('span', { style: { whiteSpace: 'nowrap', overflow: 'hidden' } }, value || placeholder),
      caret ? h('span', { style: { width: 1.5, height: 18, background: C.ink, marginLeft: -6 } }) : null);
  }
  function Select({ k, value, w, focus }) {
    return h('div', { ref: R(k), style: { height: 36, borderRadius: 10, border: `1px solid ${focus ? C.ink : C.n200}`, padding: '0 10px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 14, width: w, boxSizing: 'border-box', background: '#fff' } }, h('span', null, value), h(Ic, { n: 'chevron-down', s: 16, color: C.muted }));
  }
  const Label = ({ children, style }) => h('div', { style: Object.assign({ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }, style) }, children);
  const Hint = ({ children, style }) => h('div', { style: Object.assign({ fontSize: 13, lineHeight: 1.5, color: C.muted, marginTop: 6 }, style) }, children);
  function Field({ k, label, hint, children, style }) { return h('div', { ref: R(k), style: Object.assign({ display: 'flex', flexDirection: 'column' }, style) }, label ? h(Label, null, label) : null, children, hint ? h(Hint, null, hint) : null); }
  const Sep = ({ style }) => h('div', { style: Object.assign({ height: 1, background: C.n200 }, style) });
  const Muted = ({ children, style }) => h('span', { style: Object.assign({ color: C.muted }, style) }, children);
  function Tabs({ items, active = 0, kp }) {
    return h('div', { style: { display: 'inline-flex', alignItems: 'center', height: 34, borderRadius: 10, padding: 3, background: C.n100, boxSizing: 'border-box' } },
      items.map((t, i) => h('span', { key: t, ref: kp ? reg(kp + '.' + i) : undefined, style: { height: '100%', display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', color: i === active ? C.ink : 'rgba(0,35,48,0.6)', background: i === active ? '#fff' : 'transparent', boxShadow: i === active ? '0 1px 2px rgba(0,35,48,0.1)' : 'none' } }, t)));
  }
  function Alert({ k, v = 'default', icon = 'info', title, children }) {
    const tone = { default: [C.n200, C.n0, C.ink], warning: ['rgba(192,133,11,0.4)', C.warnBg, C.warn], danger: [C.red200, C.red50, C.red600], success: ['rgba(22,115,73,0.3)', C.succBg, C.succ] }[v];
    return h('div', { ref: R(k), style: { display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 10, rowGap: 2, borderRadius: 12, border: `1px solid ${tone[0]}`, background: tone[1], padding: '10px 12px', fontSize: 14 } },
      h('span', { style: { gridRow: 'span 2', paddingTop: 2, color: tone[2] } }, h(Ic, { n: icon, s: 16 })), h('div', { style: { fontWeight: 600 } }, title), h('div', { style: { color: C.body } }, children));
  }
  function Avatar({ name = '?', size = 32, bg = C.teal100, color = C.ink }) {
    const ini = name.split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
    return h('span', { style: { width: size, height: size, borderRadius: 999, background: bg, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 600, flex: 'none', fontFamily: F.head } }, ini);
  }
  // Table: columns [{label, w, right}], rows [{k, cells:[...], highlight}]
  function Table({ k, columns, rows, style }) {
    return h('table', { ref: R(k), style: Object.assign({ width: '100%', borderCollapse: 'collapse', fontSize: 14 }, style) },
      h('thead', null, h('tr', { style: { borderBottom: `1px solid ${C.n200}` } }, columns.map((c, i) => h('th', { key: i, style: { height: 40, padding: '0 10px', textAlign: c.right ? 'right' : 'left', fontWeight: 500, color: C.muted, width: c.w, whiteSpace: 'nowrap' } }, c.label)))),
      h('tbody', null, rows.map((r, i) => h('tr', { key: i, ref: r.k ? reg(r.k) : undefined, style: { borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${C.n200}`, background: r.highlight ? C.red50 : 'transparent' } },
        r.cells.map((c, j) => h('td', { key: j, style: { padding: '10px', textAlign: columns[j] && columns[j].right ? 'right' : 'left', whiteSpace: 'nowrap' } }, c))))));
  }

  // Generic SaaS admin shell: dark sidebar + top bar.
  // nav: [{group, items:[{id, label, icon}]}]; registers `${kp}.${id}` per item, `${kp}.root`
  function AppShell({ nav = [], active, title, crumbs, actions, user, logo = true, product, kp = 'sb', children, glow = {}, width = 1440, height = 900, contentStyle }) {
    return h('div', { style: { display: 'flex', width, minHeight: height, background: C.n50, fontFamily: F.body, color: C.ink, fontSize: 14 } },
      h('aside', { ref: reg(kp + '.root'), style: { width: 248, flex: 'none', background: C.ink, color: '#fff', display: 'flex', flexDirection: 'column', padding: '18px 12px' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 18px' } }, logo ? h(Logo, { white: true, height: 26 }) : null, product ? h('span', { style: { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal300, marginTop: 4 } }, product) : null),
        nav.map((g) => h('div', { key: g.group || 'g', style: { marginBottom: 14 } },
          g.group ? h('div', { style: { fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: glow[g.group] ? '#fff' : C.teal300, padding: '6px 10px' } }, g.group) : null,
          g.items.map((it) => {
            const on = it.id === active, gl = glow[it.id] || 0;
            return h('div', { key: it.id, ref: reg(kp + '.' + it.id), style: { display: 'flex', alignItems: 'center', gap: 10, height: 36, padding: '0 10px', borderRadius: 9, fontSize: 14, fontWeight: on ? 600 : 500, color: on ? '#fff' : 'rgba(255,255,255,0.78)', background: on ? C.brand : gl ? `rgba(255,255,255,${0.12 * gl})` : 'transparent' } },
              it.icon ? h(Ic, { n: it.icon, s: 17 }) : null, it.label, it.badge ? h('span', { style: { marginLeft: 'auto', fontSize: 11, fontWeight: 600, background: on ? '#fff' : C.brand, color: on ? C.brand : '#fff', borderRadius: 99, padding: '1px 7px' } }, it.badge) : null);
          }))),
        h('div', { style: { flex: 1 } }),
        user ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' } }, h(Avatar, { name: user.name, size: 30, bg: C.ink700, color: '#fff' }),
          h('div', { style: { lineHeight: 1.3 } }, h('div', { style: { fontSize: 13, fontWeight: 600 } }, user.name), h('div', { style: { fontSize: 11.5, color: C.teal300 } }, user.email))) : null),
      h('main', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } },
        h('header', { ref: reg(kp + '.top'), style: { height: 60, flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px', borderBottom: `1px solid ${C.n200}`, background: '#fff' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.muted } }, (crumbs || []).map((c, i) => h(React.Fragment, { key: i }, h('span', null, c), h(Ic, { n: 'chevron-right', s: 14 })))),
          h('div', { style: { fontFamily: F.head, fontWeight: 600, fontSize: 17, color: C.ink } }, title), h('div', { style: { flex: 1 } }), actions),
        h('div', { style: Object.assign({ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }, contentStyle) }, children)));
  }

  // ------------------------------------------------------------------------
  // Motion-graphic building blocks (authored at 1080p stage size)
  // ------------------------------------------------------------------------
  // Slow drifting brand glows + dot grid. Premium, never distracting.
  function Backdrop({ T, dark, dots = true, glow = true }) {
    const a = T * 0.05;
    const g1 = { x: 72 + 6 * Math.sin(a), y: 18 + 5 * Math.cos(a * 1.3) }, g2 = { x: 14 + 5 * Math.cos(a * 0.8), y: 86 + 4 * Math.sin(a) };
    const base = dark ? C.ink : C.n100;
    return h('div', { style: { position: 'absolute', inset: 0, background: base, overflow: 'hidden' } },
      glow ? h('div', { style: { position: 'absolute', inset: 0, background: `radial-gradient(900px 600px at ${g1.x}% ${g1.y}%, ${dark ? 'rgba(217,4,41,0.22)' : 'rgba(217,4,41,0.07)'}, transparent 70%), radial-gradient(800px 600px at ${g2.x}% ${g2.y}%, ${dark ? 'rgba(79,132,148,0.25)' : 'rgba(79,132,148,0.10)'}, transparent 70%)` } }) : null,
      dots ? h('div', { style: { position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,35,48,0.08)'} 1.2px, transparent 1.4px)`, backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 40%, transparent 100%)' } }) : null);
  }
  const Kicker = ({ children, dark, style }) => h('div', { style: Object.assign({ fontFamily: F.head, fontWeight: 600, fontSize: 22, letterSpacing: '0.14em', textTransform: 'uppercase', color: dark ? C.pink : C.brand }, style) }, children);
  // Highlighted words inside a title: a brand marker sweeps under the text at `at`
  function Hl({ T, at, children, color }) {
    const p = M.draw(T, at, at + 0.6);
    return h('span', { style: { position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' } },
      h('span', { style: { position: 'absolute', left: -6, right: -6, bottom: '0.06em', height: '0.32em', background: color || 'rgba(217,4,41,0.22)', borderRadius: 6, transformOrigin: '0 50%', transform: `scaleX(${p.toFixed(4)})` } }),
      h('span', { style: { position: 'relative' } }, children));
  }
  // Title block: kicker -> title -> subtitle, staggered from `at`
  function Title({ T, at = 0, kicker, title, sub, dark, align = 'left', size = 84, maxWidth = 1300, style }) {
    return h('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 22, alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, maxWidth }, style) },
      kicker ? h('div', { style: M.enter(T, at) }, h(Kicker, { dark }, kicker)) : null,
      h('div', { style: Object.assign({ fontFamily: F.head, fontWeight: 700, fontSize: size, lineHeight: 1.06, letterSpacing: '-0.02em', color: dark ? '#fff' : C.ink, textWrap: 'balance' }, M.enter(T, at + 0.12, 0.55, 22)) }, title),
      sub ? h('div', { style: Object.assign({ fontFamily: F.body, fontWeight: 500, fontSize: Math.round(size * 0.36), lineHeight: 1.4, color: dark ? C.teal200 : C.n600, maxWidth: maxWidth * 0.8, textWrap: 'pretty' }, M.enter(T, at + 0.32)) }, sub) : null);
  }
  // Numbered steps. at: array of times (one per step) or a start time (staggered 0.18s)
  // active: index of the current step (others dim; earlier ones get a check)
  function StepList({ T, steps, at = 0, active = -1, dark, kp = 'step', size = 1, gap = 18, style }) {
    const times = Array.isArray(at) ? at : steps.map((_, i) => at + i * 0.18);
    return h('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: gap * size }, style) },
      steps.map((s, i) => {
        const done = active >= 0 && i < active, on = i === active, dim = active >= 0 && !on;
        return h('div', { key: i, ref: reg(kp + '.' + i), style: Object.assign({ display: 'flex', alignItems: 'center', gap: 22 * size, padding: `${16 * size}px ${22 * size}px`, borderRadius: 18 * size, background: on ? (dark ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent', boxShadow: on && !dark ? '0 14px 40px rgba(0,35,48,0.10), 0 0 0 1px rgba(0,35,48,0.06)' : 'none', opacity: dim && !done ? 0.55 : 1 }, M.enter(T, times[i])) },
          h('div', { style: { width: 54 * size, height: 54 * size, flex: 'none', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.brand : done ? (dark ? C.ink700 : C.ink) : dark ? 'rgba(255,255,255,0.1)' : C.n200, color: on || done ? '#fff' : dark ? '#fff' : C.ink, fontFamily: F.head, fontWeight: 700, fontSize: 24 * size } },
            done ? h(Ic, { n: 'check', s: 26 * size, w: 3 }) : s.icon ? h(Ic, { n: s.icon, s: 24 * size, w: 2.2 }) : String(i + 1)),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 * size } },
            h('div', { style: { fontFamily: F.head, fontWeight: 600, fontSize: 32 * size, lineHeight: 1.2, color: dark ? '#fff' : C.ink } }, s.title),
            s.desc ? h('div', { style: { fontSize: 22 * size, lineHeight: 1.35, color: dark ? C.teal200 : C.n600 } }, s.desc) : null));
      }));
  }
  // Process diagram. nodes: [{id, label, sub, icon, x, y, w?, at, tone?: 'brand'|'ink'|'light'}]
  // edges: [{from, to, at, label, dur?}] drawn as orthogonal arrows. Coordinates are
  // inside the Flow box (width x height). Registers `flow.<id>` for every node.
  function Flow({ T, nodes, edges = [], width = 1600, height = 600, dark, style, nodeH = 112 }) {
    const byId = {}; nodes.forEach((n) => { byId[n.id] = Object.assign({ w: 300, h: nodeH }, n); });
    const anchor = (n, side) => side === 'r' ? [n.x + n.w, n.y + n.h / 2] : side === 'l' ? [n.x, n.y + n.h / 2] : side === 'b' ? [n.x + n.w / 2, n.y + n.h] : [n.x + n.w / 2, n.y];
    const pathOf = (a, b) => {
      const horiz = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      if (horiz) {
        const [x1, y1] = anchor(a, b.x > a.x ? 'r' : 'l'), [x2, y2] = anchor(b, b.x > a.x ? 'l' : 'r');
        const mx = (x1 + x2) / 2;
        return { d: `M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}`, len: Math.abs(x2 - x1) + Math.abs(y2 - y1), end: [x2, y2], dir: b.x > a.x ? 0 : 180, mid: [mx, (y1 + y2) / 2] };
      }
      const [x1, y1] = anchor(a, b.y > a.y ? 'b' : 't'), [x2, y2] = anchor(b, b.y > a.y ? 't' : 'b');
      const my = (y1 + y2) / 2;
      return { d: `M${x1} ${y1} L${x1} ${my} L${x2} ${my} L${x2} ${y2}`, len: Math.abs(x2 - x1) + Math.abs(y2 - y1), end: [x2, y2], dir: b.y > a.y ? 90 : -90, mid: [(x1 + x2) / 2, my] };
    };
    const line = dark ? 'rgba(255,255,255,0.5)' : C.n400;
    return h('div', { style: Object.assign({ position: 'relative', width, height }, style) },
      h('svg', { width, height, style: { position: 'absolute', left: 0, top: 0, overflow: 'visible' } },
        edges.map((e, i) => {
          const a = byId[e.from], b = byId[e.to]; if (!a || !b) return null;
          const p = pathOf(a, b), prog = M.draw(T, e.at, e.at + (e.dur || 0.7));
          if (prog <= 0) return null;
          const head = prog >= 0.98 ? h('path', { d: 'M-12 -8 L0 0 L-12 8', fill: 'none', stroke: e.hot ? C.brand : line, strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round', transform: `translate(${p.end[0]} ${p.end[1]}) rotate(${p.dir})` }) : null;
          return h('g', { key: i },
            h('path', { d: p.d, fill: 'none', stroke: e.hot ? C.brand : line, strokeWidth: 3.5, strokeLinejoin: 'round', strokeDasharray: p.len, strokeDashoffset: p.len * (1 - prog) }), head,
            e.label ? h('text', { x: p.mid[0], y: p.mid[1] - 14, textAnchor: 'middle', fontFamily: F.body, fontWeight: 600, fontSize: 20, fill: dark ? C.teal200 : C.n600, opacity: ramp(T, e.at + 0.4, e.at + 0.8) }, e.label) : null);
        })),
      nodes.map((n0) => {
        const n = byId[n0.id];
        const tone = n.tone || 'light';
        const bg = tone === 'brand' ? C.brand : tone === 'ink' ? C.ink : dark ? C.ink800 : '#fff';
        const fg = tone === 'light' && !dark ? C.ink : '#fff';
        return h('div', { key: n.id, ref: reg('flow.' + n.id), style: Object.assign({ position: 'absolute', left: n.x, top: n.y, width: n.w, height: n.h, boxSizing: 'border-box', borderRadius: 20, background: bg, color: fg, display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', boxShadow: tone === 'light' && !dark ? '0 14px 40px rgba(0,35,48,0.10), 0 0 0 1px rgba(0,35,48,0.08)' : '0 14px 40px rgba(0,35,48,0.25)' }, M.pop(T, n.at)) },
          n.icon ? h('div', { style: { width: 54, height: 54, borderRadius: 14, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tone === 'light' ? (dark ? 'rgba(255,255,255,0.1)' : C.red50) : 'rgba(255,255,255,0.16)', color: tone === 'light' && !dark ? C.brand : '#fff' } }, h(Ic, { n: n.icon, s: 28, w: 2.2 })) : null,
          h('div', { style: { minWidth: 0 } }, h('div', { style: { fontFamily: F.head, fontWeight: 600, fontSize: 26, lineHeight: 1.15 } }, n.label), n.sub ? h('div', { style: { fontSize: 19, marginTop: 4, opacity: 0.75, lineHeight: 1.3 } }, n.sub) : null));
      }));
  }
  // Checklist: items [{text, at, check?}] — each enters at `at`, ticks at `check` (default at+0.5)
  function Checklist({ T, items, title, dark, kp = 'chk', size = 1, style }) {
    return h('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 16 * size }, style) },
      title ? h('div', { style: Object.assign({ fontFamily: F.head, fontWeight: 700, fontSize: 44 * size, color: dark ? '#fff' : C.ink, marginBottom: 10 * size }, M.enter(T, items[0] ? items[0].at - 0.3 : 0)) }, title) : null,
      items.map((it, i) => {
        const ck = it.check != null ? it.check : it.at + 0.5;
        const p = M.draw(T, ck, ck + 0.35);
        return h('div', { key: i, ref: reg(kp + '.' + i), style: Object.assign({ display: 'flex', alignItems: 'center', gap: 20 * size, fontSize: 30 * size, fontWeight: 500, color: dark ? '#fff' : C.ink }, M.enter(T, it.at)) },
          h('div', { style: { width: 40 * size, height: 40 * size, flex: 'none', borderRadius: 10 * size, border: `2.5px solid ${p > 0 ? C.brand : dark ? 'rgba(255,255,255,0.4)' : C.n300}`, background: p > 0 ? C.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            h('svg', { viewBox: '0 0 24 24', width: 26 * size, height: 26 * size }, h('path', { d: 'M5 12.5l4.5 4.5L19 7.5', fill: 'none', stroke: '#fff', strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: 22, strokeDashoffset: 22 * (1 - p) }))),
          h('span', null, it.text));
      }));
  }
  // Rule cards: rules [{kind:'do'|'dont'|'warn'|'info', title, text, at}]
  function RuleCards({ T, rules, dark, columns, kp = 'rule', style }) {
    const tone = { do: [C.succ500, C.succBg, 'check-circle'], dont: [C.brand, C.red50, 'ban'], warn: [C.warn, C.warnBg, 'triangle-alert'], info: [C.ink500, C.teal100, 'info'] };
    return h('div', { style: Object.assign({ display: 'grid', gridTemplateColumns: `repeat(${columns || Math.min(rules.length, 3)}, 1fr)`, gap: 28 }, style) },
      rules.map((r, i) => {
        const t = tone[r.kind || 'info'];
        return h('div', { key: i, ref: reg(kp + '.' + i), style: Object.assign({ borderRadius: 24, padding: '32px 32px 34px', background: dark ? C.ink800 : '#fff', boxShadow: dark ? 'none' : '0 14px 40px rgba(0,35,48,0.08), 0 0 0 1px rgba(0,35,48,0.06)', borderTop: `6px solid ${t[0]}`, display: 'flex', flexDirection: 'column', gap: 16 }, M.enter(T, r.at, 0.5, 20)) },
          h('div', { style: { width: 60, height: 60, borderRadius: 16, background: dark ? 'rgba(255,255,255,0.08)' : t[1], color: t[0], display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Ic, { n: r.icon || t[2], s: 32, w: 2.2 })),
          h('div', { style: { fontFamily: F.head, fontWeight: 600, fontSize: 32, lineHeight: 1.2, color: dark ? '#fff' : C.ink } }, r.title),
          r.text ? h('div', { style: { fontSize: 23, lineHeight: 1.45, color: dark ? C.teal200 : C.n600 } }, r.text) : null);
      }));
  }
  // Big number that counts up from `at` over `dur`
  function Metric({ T, at, dur = 1.2, value, from = 0, decimals = 0, prefix = '', suffix = '', label, dark, size = 150, color, k, style }) {
    const v = M.glide(T, at, at + dur, from, value, Easing.easeOutCubic);
    const txt = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US');
    // while it counts, the in-between values are not claims: the gate skips them (data-noclaim)
    return h('div', { ref: R(k), 'data-noclaim': T < at + dur ? '' : undefined, style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 8 }, M.enter(T, at - 0.15), style) },
      h('div', { style: { fontFamily: F.head, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: '-0.03em', color: color || (dark ? '#fff' : C.ink), fontVariantNumeric: 'tabular-nums' } }, prefix + txt + suffix),
      label ? h('div', { style: { fontSize: size * 0.2, fontWeight: 500, color: dark ? C.teal200 : C.n600 } }, label) : null);
  }
  // SOP progress: steps [{label, at}] — highlights the step whose `at` is the latest <= T
  function StepTracker({ T, steps, dark, style }) {
    let cur = -1; steps.forEach((s, i) => { if (T >= s.at) cur = i; });
    return h('div', { 'data-noclaim': '', style: Object.assign({ display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.head, fontWeight: 600, fontSize: 17 }, style) },
      steps.map((s, i) => h(React.Fragment, { key: i },
        i ? h('div', { style: { width: 26, height: 2, background: i <= cur ? C.brand : dark ? 'rgba(255,255,255,0.2)' : C.n300 } }) : null,
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 14px 0 6px', borderRadius: 999, background: i === cur ? (dark ? '#fff' : C.ink) : 'transparent', color: i === cur ? (dark ? C.ink : '#fff') : dark ? 'rgba(255,255,255,0.6)' : C.n600 } },
          h('span', { style: { width: 26, height: 26, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: i < cur ? C.brand : i === cur ? C.brand : dark ? 'rgba(255,255,255,0.12)' : C.n200, color: i <= cur ? '#fff' : dark ? '#fff' : C.ink } }, i < cur ? h(Ic, { n: 'check', s: 15, w: 3 }) : i + 1),
          s.label))));
  }
  const Pill = ({ children, dark, tone, style }) => h('span', { style: Object.assign({ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px', borderRadius: 999, fontFamily: F.head, fontWeight: 600, fontSize: 19, background: tone === 'brand' ? C.brand : dark ? 'rgba(255,255,255,0.1)' : '#fff', color: tone === 'brand' || dark ? '#fff' : C.ink, boxShadow: dark || tone === 'brand' ? 'none' : '0 0 0 1px rgba(0,35,48,0.1)' }, style) }, children);
  const KeyCap = ({ children }) => h('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, height: 44, padding: '0 12px', borderRadius: 10, background: '#fff', border: `1px solid ${C.n300}`, borderBottomWidth: 4, fontFamily: F.mono, fontSize: 20, color: C.ink } }, children);
  // Closing card on the dark ink background
  function EndCard({ T, at = 0, title, lines = [], footer, style }) {
    return h('div', { style: Object.assign({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, textAlign: 'center' }, style) },
      h('div', { style: M.enter(T, at) }, h(Logo, { white: true, height: 64 })),
      title ? h('div', { style: Object.assign({ fontFamily: F.head, fontWeight: 700, fontSize: 64, lineHeight: 1.1, color: '#fff', maxWidth: 1300, textWrap: 'balance' }, M.enter(T, at + 0.2, 0.55, 18)) }, title) : null,
      lines.length ? h('div', { style: { display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1500 } }, lines.map((l, i) => h('div', { key: i, style: M.enter(T, at + 0.5 + i * 0.15) }, h(Pill, { dark: true }, l)))) : null,
      footer ? h('div', { style: Object.assign({ fontSize: 24, color: C.teal200 }, M.enter(T, at + 0.9 + lines.length * 0.15)) }, footer) : null);
  }

  window.KIT = {
    C, F, LOGO, LOGO_WHITE, MARK, Logo, Mark, Ic, ICONS: IC,
    Card, CardHeader, CardContent, Badge, Button, Switch, Checkbox, Input, Select, Label, Hint, Field, Sep, Muted, Tabs, Alert, Avatar, Table, AppShell,
    Backdrop, Kicker, Hl, Title, StepList, Flow, Checklist, RuleCards, Metric, StepTracker, Pill, KeyCap, EndCard,
  };
})();
