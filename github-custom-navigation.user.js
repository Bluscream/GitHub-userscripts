// ==UserScript==
// @name        GitHub Custom Navigation
// @version     1.0.13
// @description A userscript that allows you to customize GitHub's main navigation bar
// @license     MIT
// @author      Rob Garrison
// @namespace   https://github.com/Mottie
// @include     https://github.com/*
// @include     https://gist.github.com/*
// @run-at      document-end
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @icon        https://github.com/fluidicon.png
// @require     https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.js
// @updateURL   https://raw.githubusercontent.com/Mottie/Github-userscripts/master/github-custom-navigation.user.js
// @downloadURL https://raw.githubusercontent.com/Mottie/Github-userscripts/master/github-custom-navigation.user.js
// ==/UserScript==
(() => {
	"use strict";

	// open menu via hash
	const panelHash = "#github-custom-nav-settings",
		// when the bar gets wider than this number, adjust the width of the search input
		adjustWidth = 460,
		// when search input width is adjusted, this is the minimum width
		minSearchInputWidth = 200,
		// get user name; or empty string if not logged in
		user = $("meta[name='user-login']") &&
			$("meta[name='user-login']").getAttribute("content") || "",

		defaults = {
			github: [
				"pr", "issues", "gist", "separator", "stars", "watching", "separator",
				"profile", "blog", "menu"
			],
			gists: [
				"gistall", "giststars", "github", "separator", "pr", "issues", "stars",
				"watching", "separator", "profile", "blog", "menu"
			],

			currentLink: "pr",
			// using full length url so the links work from any subdomain (e.g. gist pages)
			items: {
				"advsearch": {
					url: "https://github.com/search/advanced",
					tooltip: "Advanced Search",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' width='16' viewBox='0 0 16 16'><path d='M15.7 14.3L11.89 10.47c0.7-0.98 1.11-2.17 1.11-3.47 0-3.31-2.69-6-6-6S1 3.69 1 7s2.69 6 6 6c1.3 0 2.48-0.41 3.47-1.11l3.83 3.81c0.19 0.2 0.45 0.3 0.7 0.3s0.52-0.09 0.7-0.3c0.39-0.39 0.39-1.02 0-1.41zM7 11.7c-2.59 0-4.7-2.11-4.7-4.7s2.11-4.7 4.7-4.7 4.7 2.11 4.7 4.7-2.11 4.7-4.7 4.7z'/></svg>"
				},
				"blog": {
					url: "https://github.com/blog",
					tooltip: "Blog",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 16 16' width='16'><path d='M9 9H8c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1H6c-.55 0-1 .45-1 1v2h1v3c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-3h1v-2c0-.55-.45-1-1-1zM7 7h1v1H7V7zm2 4H8v4H7v-4H6v-1h3v1zm2.09-3.5c0-1.98-1.61-3.59-3.59-3.59A3.593 3.593 0 0 0 4 8.31v1.98c-.61-.77-1-1.73-1-2.8 0-2.48 2.02-4.5 4.5-4.5S12 5.01 12 7.49c0 1.06-.39 2.03-1 2.8V8.31c.06-.27.09-.53.09-.81zm3.91 0c0 2.88-1.63 5.38-4 6.63v-1.05a6.553 6.553 0 0 0 3.09-5.58A6.59 6.59 0 0 0 7.5.91 6.59 6.59 0 0 0 .91 7.5c0 2.36 1.23 4.42 3.09 5.58v1.05A7.497 7.497 0 0 1 7.5 0C11.64 0 15 3.36 15 7.5z'/></svg>"
				},
				"explore": {
					url: "https://github.com/explore",
					tooltip: "Explore",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 16 16' width='16'><path d='M10 1c-.17 0-.36.05-.52.14C8.04 2.02 4.5 4.58 3 5c-1.38 0-3 .67-3 2.5S1.63 10 3 10c.3.08.64.23 1 .41V15h2v-3.45c1.34.86 2.69 1.83 3.48 2.31.16.09.34.14.52.14.52 0 1-.42 1-1V2c0-.58-.48-1-1-1zm0 12c-.38-.23-.89-.58-1.5-1-.16-.11-.33-.22-.5-.34V3.31c.16-.11.31-.2.47-.31.61-.41 1.16-.77 1.53-1v11zm2-6h4v1h-4V7zm0 2l4 2v1l-4-2V9zm4-6v1l-4 2V5l4-2z'></path></svg>"
				},
				"gist": {
					url: "https://gist.github.com/",
					tooltip: "Gist",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 12 16' width='12'><path d='M7.5 5L10 7.5 7.5 10l-.75-.75L8.5 7.5 6.75 5.75 7.5 5zm-3 0L2 7.5 4.5 10l.75-.75L3.5 7.5l1.75-1.75L4.5 5zM0 13V2c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1zm1 0h10V2H1v11z'></path></svg>"
				},
				"gistall": {
					url: "https://gist.github.com/discover",
					tooltip: "Discover Gists",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 12 16' width='12'><path d='M7.5 5L10 7.5 7.5 10l-.75-.75L8.5 7.5 6.75 5.75 7.5 5zm-3 0L2 7.5 4.5 10l.75-.75L3.5 7.5l1.75-1.75L4.5 5zM0 13V2c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1zm1 0h10V2H1v11z'></path></svg>"
				},
				"giststars": {
					url: "https://gist.github.com/${me}/starred",
					tooltip: "Starred Gists",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 14 16' width='14'><path d='M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z'></path></svg>"
				},
				"github": {
					url: "https://github.com",
					tooltip: "GitHub",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 16 16' width='16'><path d='M14.7 5.34c.13-.32.55-1.59-.13-3.31 0 0-1.05-.33-3.44 1.3-1-.28-2.07-.32-3.13-.32s-2.13.04-3.13.32c-2.39-1.64-3.44-1.3-3.44-1.3-.68 1.72-.26 2.99-.13 3.31C.49 6.21 0 7.33 0 8.69 0 13.84 3.33 15 7.98 15S16 13.84 16 8.69c0-1.36-.49-2.48-1.3-3.35zM8 14.02c-3.3 0-5.98-.15-5.98-3.35 0-.76.38-1.48 1.02-2.07 1.07-.98 2.9-.46 4.96-.46 2.07 0 3.88-.52 4.96.46.65.59 1.02 1.3 1.02 2.07 0 3.19-2.68 3.35-5.98 3.35zM5.49 9.01c-.66 0-1.2.8-1.2 1.78s.54 1.79 1.2 1.79c.66 0 1.2-.8 1.2-1.79s-.54-1.78-1.2-1.78zm5.02 0c-.66 0-1.2.79-1.2 1.78s.54 1.79 1.2 1.79c.66 0 1.2-.8 1.2-1.79s-.53-1.78-1.2-1.78z'/></svg>"
				},
				"integrations": {
					url: "https://github.com/integrations",
					tooltip: "Integrations",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 14 16' width='14'><path d='M3 6c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1H3zm8 1.75L9.75 9h-1.5L7 7.75 5.75 9h-1.5L3 7.75V7h.75L5 8.25 6.25 7h1.5L9 8.25 10.25 7H11v.75zM5 11h4v1H5v-1zm2-9C3.14 2 0 4.91 0 8.5V13c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V8.5C14 4.91 10.86 2 7 2zm6 11H1V8.5c0-3.09 2.64-5.59 6-5.59s6 2.5 6 5.59V13z'></path></svg>"
				},
				"issues": {
					url: "https://github.com/issues",
					tooltip: "Issues",
					hotkey: "g i",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 14 16' width='14'><path d='M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z'></path></svg>"
				},
				"menu": {
					url: panelHash,
					tooltip: "Open Custom Navigation Settings",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 14 16' width='14'><path d='M8.79 15H6.553l-.7-1.91-.608-.247-1.835.905-1.585-1.556.892-1.83-.25-.595L.5 9.127V6.933l1.944-.676.25-.597-.922-1.802L3.358 2.3l1.865.876.624-.248.638-1.93H8.73l.697 1.91.61.246 1.838-.905 1.58 1.555-1.114 2.317-2.714.65-.203-.24c-.444-.524-1.098-.824-1.794-.824C6.34 5.708 5.294 6.736 5.294 8c0 1.264 1.047 2.292 2.334 2.292.6 0 1.17-.224 1.604-.63l.18-.165 2.93.4 1.156 2.24-1.58 1.564-1.868-.88-.625.25L8.79 15zm-1.52-1h.78l.556-1.68 1.48-.592 1.62.765.553-.547-.583-1.13-1.93-.264c-.597.48-1.34.74-2.118.74-1.85 0-3.354-1.477-3.354-3.292 0-1.815 1.503-3.292 3.353-3.292.89 0 1.73.342 2.356.95l1.643-.394.6-1.25-.555-.546-1.598.786-1.455-.592L8.014 2h-.79L6.67 3.68l-1.48.59-1.622-.762-.556.546.802 1.566-.603 1.432-1.692.59v.763l1.71.558.603 1.43-.775 1.593.556.546 1.596-.788 1.456.593L7.27 14z'/></svg>"
				},
				"pr": {
					url: "https://github.com/pulls",
					tooltip: "Pull Requests",
					hotkey: "g p",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 12 16' width='12'><path d='M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z'></path></svg>"
				},
				"profile": {
					url: "https://github.com/${me}",
					tooltip: "Profile",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 8 16' width='8'><path d='M7 6H1c-.55 0-1 .45-1 1v5h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2V7c0-.55-.45-1-1-1zm0 5H6V9H5v6H3V9H2v2H1V7h6v4zm0-8c0-1.66-1.34-3-3-3S1 1.34 1 3s1.34 3 3 3 3-1.34 3-3zM4 5c-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2z' fill-rule='evenodd'/></svg>"
				},
				"settings": {
					url: "https://github.com/settings/profile",
					tooltip: "Settings",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 14 16' width='14'><path d='M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z'></path></svg>"
				},
				"stars": {
					url: "https://github.com/stars",
					tooltip: "Stars",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 14 16' width='14'><path d='M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z'></path></svg>"
				},
				"trending": {
					url: "https://github.com/trending",
					tooltip: "Trending",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 12 16' width='12'><path d='M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z'></path></svg>"
				},
				"watching": {
					url: "https://github.com/watching",
					tooltip: "Watching",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 16 16' width='16'><path d='M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z'></path></svg>"
				},
				"zenhub": {
					url: "#todo",
					tooltip: "ZenHub ToDo",
					hotkey: "",
					content: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 50 50' width='16'><path d='M29.17 45.988L13.82 21.218h10.56l-1.1-17.206 13.498 24.77h-9.514'/></svg>"
				}
			}
		},
		icons = {
			add: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='14' viewBox='0 0 12 16' width='12'><path d='M12 9H7v5H5V9H0V7h5V2h2v5h5'/></svg>",
			close: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 9 9'><path d='M9 1L5.4 4.4 9 8 8 9 4.6 5.4 1 9 0 8l3.6-3.5L0 1l1-1 3.5 3.6L8 0l1 1z'></path></svg>",
			info: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' height='16' width='14' viewBox='0 0 16 14'><path d='M6 10h2v2H6V10z m4-3.5c0 2.14-2 2.5-2 2.5H6c0-0.55 0.45-1 1-1h0.5c0.28 0 0.5-0.22 0.5-0.5v-1c0-0.28-0.22-0.5-0.5-0.5h-1c-0.28 0-0.5 0.22-0.5 0.5v0.5H4c0-1.5 1.5-3 3-3s3 1 3 2.5zM7 2.3c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z'/></svg>",
			separator: "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' height='16' viewBox='0 0 12 16' width='12'><path d='M7 16H5V0h2'/></svg>"
		};

	let drake,
		editMode = false,
		panelHashTriggered = false,
		// remember scrollTop when settings panel opens (if using sticky nav header
		// style)
		scrollTop = 0,
		settings = GM_getValue("custom-links", defaults);

	function addPanel() {
		GM_addStyle(`
			/* Use border right when a vertical bar is added */
			.header-navlink.ghcn-separator { border-right:#777 1px solid;
				padding:4px 0; }
			/* settings panel */
			#ghcn-overlay { position:fixed; top:50px; left:0; right:0; bottom:0;
				z-index:45; background:rgba(0,0,0,.5); display:none; }
			#ghcn-menu { cursor:pointer; }
			.ghcn-close, .ghcn-code { float:right; cursor:pointer; font-size:.8em;
				margin-left:3px; padding:0 6px 2px 6px; }
			.ghcn-close .octicon { vertical-align:middle; fill:currentColor; }
			#ghcn-settings-inner { position:fixed; left:50%; top:55px; z-index:50;
				width:30rem; transform:translate(-50%,0); box-shadow:0 .5rem 1rem #111;
				color:#c0c0c0; display:none; }
			#ghcn-settings-inner input { width:85%; float:right; border-style:solid;
				border-width:1px; max-height:35px; }
			.ghcn-settings-wrapper div { line-height:38px; }
			#ghcn-nav-items { min-height: 38px; }
			#ghcn-nav-items .header-nav-item { margin-bottom:4px; }
			.ghcn-settings-wrapper hr { margin: 10px 0; }
			.ghcn-footer { margin-top:4px; border-top:#555 solid 1px; }
			.header-navlink { height:28px; }
			ul.header-nav .header-navlink svg,
				ul.header-nav .header-navlink img,
				#ghcn-nav-items .header-navlink svg,
				#ghcn-nav-items .header-navlink img, .gu-mirror svg, .gu-mirror img {
				max-height:16px; fill:currentColor; vertical-align:middle;
				overflow:visible; }
			/* override white text when settings panel is open*/
			body.ghcn-settings-open #ghcn-nav-items .text-emphasized {
				color: #24292e; }
			/* panel open */
			body.ghcn-settings-open {
				overflow:hidden !important; /* !important overrides wiki style */ }
			/* hide other header elements while settings is open (overflow issues) */
			body.ghcn-settings-open .header-search,
				body.ghcn-settings-open #user-links,
				body.ghcn-settings-open .header-logo-invertocat,
				body.ghcn-settings-open .header-logo-wordmark,
				.gist-header .octicon-logo-github, /* hide GitHub logo on Gist page */
				.zh-todo-link { display:none; }
			body.ghcn-settings-open ul.header-nav { width:100%; }
			body.ghcn-settings-open .header-navlink > * { pointer-events:none; }
			body.ghcn-settings-open #ghcn-overlay,
			body.ghcn-settings-open #ghcn-settings-inner,
			#ghcn-nav-items { display:block; }
			body.ghcn-settings-open ul.header-nav .header-nav-item,
			.ghcn-settings-wrapper .header-nav-item { cursor:move;
				border:#555 1px solid; border-radius:4px; margin-left: 2px;
				display:inline-block; }
			body.ghcn-settings-open .header-navlink,
				.ghcn-settings-wrapper .header-navlink { min-height:auto;
				min-width:16px; padding-top:1px; }
			body.ghcn-settings-open .header .header-navlink.form-control {
				background-color: transparent; border: 1px solid #444; }
			/* JSON code block */
			.ghcn-json-code { display:none; font-family:Menlo, Inconsolata,
				"Droid Mono", monospace; font-size:1em; }
			.ghcn-visible { display:block; position:absolute; top:38px; bottom:0;
				left:2px; right:2px; z-index:1;
				width:476px; max-width:476px; }
			/* Dragula.min.css v3.7.2 (Microsoft definitions removed) */
			.gu-mirror { position:fixed !important; margin:0 !important;
				z-index:9999 !important; opacity:.8; list-style:none; }
			.gu-hide { display:none !important; }
			.gu-unselectable { -webkit-user-select:none !important;
				-moz-user-select:none !important; user-select:none !important; }
			.gu-transit { opacity:.2; }
		`);

		make({
			el: "div",
			appendTo: "body",
			attr: {
				id: "ghcn-settings"
			},
			html: `
				<div id="ghcn-overlay"></div>
				<div id="ghcn-settings-inner" class="boxed-group">
					<h3>GitHub Custom Navigation Settings
						<button type="button" class="ghcn-close btn btn-sm">${icons.close}</button>
						<button type="button" class="ghcn-code btn btn-sm tooltipped tooltipped-n" aria-label="Toggle JSON data view">{ }</button>
					</h3>
					<div class="ghcn-settings-wrapper boxed-group-inner">
						<ul id="ghcn-nav-items" class="BtnGroup header-nav"></ul>
						<hr>
						<form>
							<p>Click an link above to edit its properties
								<a href="https://github.com/Mottie/GitHub-userscripts/wiki/GitHub-custom-navigation" class="tooltipped tooltipped-e" aria-label="Click to learn about the properties below">${icons.info}</a>
							</p>
							<div>URL
								<span class="tooltipped tooltipped-e" aria-label="Enter a full URL, or hash">${icons.info}</span>
								<input class="form-control ghcn-url" type="text"/>
							</div>
							<div>Tooltip<input class="form-control ghcn-tooltip" type="text"/></div>
							<div>Hotkey
								<a href="https://github.com/Mottie/GitHub-userscripts/wiki/GitHub-custom-navigation#hotkey" class="tooltipped tooltipped-e ghcn-hotkey-link" aria-label="Click to learn about hotkeys">${icons.info}</a>
								<input class="form-control ghcn-hotkey" type="text"/>
							</div>
							<div>Content
								<span class="tooltipped tooltipped-e" aria-label="Include text and/or HTML (&lt;svg&gt; or &lt;img&gt;)">${icons.info}</span>
								<input class="form-control ghcn-content" type="text"/>
							</div>
						</form>
						<textarea class="ghcn-json-code"></textarea>
						<div class="ghcn-footer">
							<span class="btn btn-sm ghcn-add">${icons.add} New Link</span>
							<span class="btn btn-sm ghcn-destroy btn-danger tooltipped tooltipped-n" aria-label="Completely remove selected link">Destroy</span>
							<span class="btn btn-sm ghcn-reset tooltipped tooltipped-n" aria-label="Restore Defaults">Reset</span>
						</div>
					</div>
				</div>`
		});
	}

	function updatePanel() {
		let indx, item, inNav, inSettings,
			panelStr = "#ghcn-nav-items",
			panel = $(panelStr),
			setItems = settings[getLocation()],
			keys = Object.keys(settings.items),
			len = keys.length;
		for (indx = 0; indx < len; indx++) {
			item = keys[indx];
			inNav = setItems.indexOf(item) > -1;
			inSettings = $(panelStr + ` .header-nav-item[data-ghcn="${item}"]`);
			// customize adds stuff to main nav
			if (inNav && inSettings) {
				panel.removeChild(inSettings);
			} else if (!inNav && !inSettings) {
				addToMenu(item, panelStr);
			}
		}
		if (!$(panelStr + " .header-nav-item[data-ghcn='separator']")) {
			addToMenu("separator", panelStr);
		}
		selectItem();
	}

	function openPanel() {
		scrollTop = document.documentElement.scrollTop;
		window.scrollTo(0, 0);
		$("body").classList.add("ghcn-settings-open");
		editMode = true;
		customize();
		$(".modal-backdrop").click();
		$(".ghcn-json-code").classList.remove("ghcn-visible");
	}

	function openPanelOnHash() {
		if (!panelHashTriggered && window.location.hash === panelHash) {
			panelHashTriggered = true;
			openPanel();
			// immediately remove the hash because I noticed issues where the "#" was
			// removed; and upon reload, a 404 page is shown because
			// "https://github.com/github-custom-navigation-settings" does not exist
			history.pushState("", document.title, window.location.pathname);
			panelHashTriggered = false;
		}
	}

	function closePanel() {
		if (editMode) {
			window.scrollTo(0, scrollTop);
			$("body").classList.remove("ghcn-settings-open");
			editMode = false;
			customize();
			$(".ghcn-json-code").classList.remove("ghcn-visible");
		}
	}

	function getLocation() {
		// used by "settings" object
		return window.location.hostname === "gist.github.com" ? "gists" : "github";
	}

	// continually destroying & reapplying Dragula sometimes ignores elements;
	// so just leave it always applied
	function addDragula() {
		let topNav = $(".header-nav");
		drake = dragula($$(".header-nav, #ghcn-nav-items"), {
			invalid: () => {
				return !editMode;
			}
		});
		drake.on("drop", () => {
			let indx, link,
				temp = [],
				list = topNav.childNodes,
				len = list.length;
			for (indx = 0; indx < len; indx++) {
				link = list[indx].getAttribute("data-ghcn");
				if (link) {
					temp[temp.length] = link;
				}
			}
			settings[getLocation()] = temp;
			GM_setValue("custom-links", settings);
			updatePanel();

		});
	}

	// Clicked item; show selection
	function selectItem() {
		// highlight current link
		let temp = $$(".header-navlink.focus");
		removeClass(temp, "focus");
		temp = $$(".header-nav-item[data-ghcn='" + (settings.currentLink || "") +
			"'] .header-navlink");
		if (temp[0]) {
			addClass(temp, "focus");
			updateLink(temp[0].parentNode);
		}
	}

	// New Link button pressed
	function createLink() {
		let name = findUniqueId("custom");
		settings.items[name] = {
			url: "",
			tooltip: "",
			hotkey: "",
			content: "*"
		};
		addToMenu(name, "#ghcn-nav-items");
		settings.currentLink = name;
		selectItem();
	}

	// append named list item to menu
	function addToMenu(name, target) {
		let html,
			item = settings.items[name] || {},
			url = (item.url || "").replace(/\$\{me\}/g, user),
			linkClass = "text-emphasized header-navlink " +
				(editMode ? "" : "js-selected-navigation-item");
		// only show tooltip if defined
		if (item.tooltip) {
			linkClass += " tooltipped tooltipped-s";
			if (/(&#10;|&#xA;)/g.test(item.tooltip)) {
				linkClass += " tooltipped-multiline";
			}
		}
		if (name === "separator") {
			html = editMode ?
				// *** Separator (icon in editMode; zero-width-space when not)
				`<span class="${linkClass} tooltipped tooltipped-s" aria-label="Menu separator">${icons.separator}</span>` :
				`<span class="header-navlink ghcn-separator linkable-line-number">&#8203;</span>`;
		} else {
			html = editMode ?
				`<span class="${linkClass}" aria-label="${item.tooltip}">${item.content}</span>` :
				// GitHub might get upset, but we're not going to bother with analytics;
				// not including "data-ga-click" nor "data-selected-links" attributes
				`<a href="${url}" class="${linkClass}" aria-label="${item.tooltip}" data-hotkey="${item.hotkey}">
					${item.content}
				</a>`;
		}
		make({
			el: "li",
			appendTo: target,
			attr: {
				"data-ghcn": name
			},
			cl4ss: "header-nav-item",
			html: html
		});
	}

	// Destroy button pressed
	function destroyLink(item) {
		if (item) {
			delete settings.items[item];
			GM_setValue("custom-links", settings);
			let el,
				indx = settings.github.indexOf(item);
			if (indx >= 0) {
				settings.github.splice(indx, 1);
			}
			indx = settings.gists.indexOf(item);
			if (indx >= 0) {
				settings.gists.splice(indx, 1);
			}
			el = $(`.header-nav-item[data-ghcn="${item}"]`);
			el.parentNode.removeChild(el);
			if ((settings.currentLink || "") === item) {
				settings.currentLink = "";
			}
			updateLink();
		}
	}

	// Reset button pressed or new JSON added
	function resetLinks(newSettings) {
		if (newSettings) {
			settings = newSettings;
		} else {
			// quick n'dirty deep merge
			let str = JSON.stringify(defaults);
			settings = JSON.parse(str);
		}
		GM_setValue("custom-links", settings);
		// remove extra items individually; dragula doesn't seem to like it when we
		// use innerHTML = ""
		let item,
			els = $$(".header-nav-item"),
			indx = els.length;
		while (indx--) {
			item = els[indx].getAttribute("data-ghcn");
			if (item !== "separator" && !settings.items.hasOwnProperty(item)) {
				destroyLink(item);
			}
		}
		customize();
	}

	// Clicked item; update input values
	function updateLink(el) {
		let item = el && el.getAttribute("data-ghcn") || "",
			link = settings.items[item] || {};
		settings.currentLink = item;
		$(".ghcn-url").value = link.url || "";
		$(".ghcn-tooltip").value = link.tooltip || "";
		$(".ghcn-hotkey").value = link.hotkey || "";
		$(".ghcn-content").value = link.content || "";

		// "separator" shouldn't show options
		$(".ghcn-settings-wrapper form").style.visibility = item === "separator" ?
			"hidden" :
			"visible";
	}

	// save changes on-the-fly
	function saveLink() {
		let name = settings.currentLink || "",
			item = $(`.header-nav-item[data-ghcn="${name}"] .header-navlink`);
		if (name) {
			settings.items[name] = {
				url: $(".ghcn-url").value,
				tooltip: $(".ghcn-tooltip").value,
				hotkey: $(".ghcn-hotkey").value,
				content: $(".ghcn-content").value
			};
			GM_setValue("custom-links", settings);
			// update item (should be unique)
			if (item) {
				// "\n" is the only thing that works as a carriage return for
				// javascript's setAttribute; see
				// http://wowmotty.blogspot.com/2014/04/methods-to-add-multi-line-css-content.html
				item.setAttribute(
					"aria-label",
					settings.items[name].tooltip.replace(/(&#10;|&#xA;)/g, "\n")
				);
				item.innerHTML = settings.items[name].content;
			}
		}
	}

	function addJSON() {
		$(".ghcn-json-code").value = JSON.stringify(settings, null, 2);
	}

	function processJSON() {
		let val,
			txt = $(".ghcn-json-code").value;
		try {
			val = JSON.parse(txt);
		} catch (err) {
			console.error("GitHub Custom Navigation: Invalid JSON!");
		}
		return val;
	}

	function addBindings() {
		// Create a menu entry
		let el,
			menu = make({
				el: "a",
				cl4ss: "dropdown-item",
				html: "Custom Nav Settings",
				attr: {
					id: "ghcn-menu"
				}
			});

		el = $$(`
			.header .dropdown-item[href='/settings/profile'],
			.header .dropdown-item[data-ga-click*='go to profile']`
		);
		// get last found item - gists only have the "go to profile" item; GitHub
		// has both
		el = el[el.length - 1];
		if (el) {
			// insert after
			el.parentNode.insertBefore(menu, el.nextSibling);
			on($("#ghcn-menu"), "click", () => {
				openPanel();
			});
		}

		on(window, "hashchange", () => {
			openPanelOnHash();
		});

		on($("#ghcn-overlay"), "click", event => {
			// ignore bubbled up events
			if (event.target.id === "ghcn-overlay") {
				closePanel();
			}
		});
		on($("body"), "keyup", event => {
			// using F2 key for testing
			if (editMode && event.keyCode === 27) {
				closePanel();
			}
		});
		on($("body"), "click", event => {
			const target = event.target;
			if (editMode && target.classList.contains("header-navlink")) {
				// header-navlink is a child of header-nav-item, but is the same size
				settings.currentLink = target.parentNode.getAttribute("data-ghcn");
				selectItem();
			}
		});
		on($$(".ghcn-settings-wrapper input"), "input change", () => {
			saveLink();
		});
		on($(".ghcn-add"), "click", () => {
			createLink();
		});
		on($(".ghcn-destroy"), "click", () => {
			destroyLink(settings.currentLink);
		});
		on($(".ghcn-reset"), "click", () => {
			resetLinks();
		});
		// close panel when hotkey link is clicked or the page scrolls on the
		// documentation wiki
		on($$(".ghcn-close, .ghcn-hotkey-link"), "click", () => {
			closePanel();
		});

		// Code
		on($(".ghcn-code"), "click", () => {
			// open JSON code textarea
			$(".ghcn-json-code").classList.toggle("ghcn-visible");
			addJSON();
		});
		// close JSON code textarea
		on($(".ghcn-json-code"), "focus", function() {
			this.select();
		});
		on($(".ghcn-json-code"), "paste", () => {
			setTimeout(() => {
				checkJSON(processJSON());
			}, 200);
		});

	}

	function checkJSON(val, init) {
		let hasGitHub = false,
			hasGists = false,
			hasItems = false;
		if (val) {
			hasGitHub = val.hasOwnProperty("github");
			hasGists = val.hasOwnProperty("gists");
			hasItems = val.hasOwnProperty("items");
			// simple validation
			if (hasGitHub && hasGists && hasItems) {
				if (!init) {
					resetLinks(val);
					$(".ghcn-json-code").classList.remove("ghcn-visible");
					selectItem();
				}
				return true;
			}
		}
		let msg = [];
		if (!hasGitHub) {
			msg.push(`"github"`);
		}
		if (!hasGists) {
			msg.push(`"gists"`);
		}
		if (!hasItems) {
			msg.push(`"items"`);
		}
		msg = msg.length ? "JSON is missing " + msg.join(" & ") : "Invalid JSON";
		console.error("GitHub Custom Navigation: " + msg, val);
		return false;
	}

	// add new link; needs a unique ID
	function findUniqueId(prefix) {
		let indx = 0,
			id = prefix + indx;
		if (settings.items[id]) {
			while (settings.items[id]) {
				id = prefix + indx++;
			}
		}
		return id;
	}

	// Main process - adds links to header navigation
	function customize() {
		let nav = $(".header ul[role='navigation']");
		if (nav) {
			nav.classList.add("header-nav");
			let indx, els,
				navStr = ".header-nav",
				setItems = settings[getLocation()],
				len = setItems.length;
			if (!len) {
				return;
			}

			els = nav.childNodes;
			indx = els.length;
			while (indx--) {
				nav.removeChild(els[indx]);
			}

			for (indx = 0; indx < len; indx++) {
				addToMenu(setItems[indx], navStr);
			}
			// make sure all svg's have an "octicon" class name
			addClass($$(navStr + " svg"), "octicon");

			if (editMode) {
				updatePanel();
			} else {
				// narrow the search bar when there are a bunch of links added
				// add delay to allow browser to complete reflow
				setTimeout(() => {
					let width = nav.offsetWidth,
						// don't let search bar get narrower than 200px; 360 = starting
						// width
						adjust = width > adjustWidth ?
							Math.round(
								Math.max(minSearchInputWidth, 360 - (width - adjustWidth))
							) + "px" :
							"";
					// default search width is 360px; we don't want to get narrower than
					// 200px
					$(".header-search-input").style.width = adjust;
				}, 100);

			}
		}
	}

	function $(selector, el) {
		return (el || document).querySelector(selector);
	}

	function $$(selector, el) {
		return Array.from((el || document).querySelectorAll(selector));
	}

	function addClass(els, name) {
		let indx = els.length;
		while (indx--) {
			els[indx].classList.add(name);
		}
	}

	function removeClass(els, name) {
		let indx = els.length;
		while (indx--) {
			els[indx].classList.remove(name);
		}
	}

	function on(els, name, callback) {
		els = Array.isArray(els) ? els : [els];
		let events = name.split(/\s+/);
		els.forEach(el => {
			events.forEach(ev => {
				el.addEventListener(ev, callback);
			});
		});
	}

	function make(obj) {
		let key,
			el = document.createElement(obj.el);
		if (obj.cl4ss) {
			el.className = obj.cl4ss;
		}
		if (obj.html) {
			el.innerHTML = obj.html;
		}
		if (obj.attr) {
			for (key in obj.attr) {
				if (obj.attr.hasOwnProperty(key)) {
					el.setAttribute(key, obj.attr[key]);
				}
			}
		}
		if (obj.appendTo) {
			$(obj.appendTo).appendChild(el);
		}
		return el;
	}

	let isValid = checkJSON(settings, "init");
	if (!isValid) {
		resetLinks();
	}
	customize();
	addPanel();
	addBindings();
	addDragula();
	openPanelOnHash();

})();
