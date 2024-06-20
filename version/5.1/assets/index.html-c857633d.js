import{_ as r,r as o,o as l,c,a as e,b as t,d as n,w as d,e as a}from"./app-20570cc0.js";const u={},h=a('<h1 id="developer-notes" tabindex="-1"><a class="header-anchor" href="#developer-notes" aria-hidden="true">#</a> Developer Notes</h1><h2 id="setup-development-environment" tabindex="-1"><a class="header-anchor" href="#setup-development-environment" aria-hidden="true">#</a> Setup development environment</h2><p>Install Visual Studio Code and following extensions:</p><ul><li>Prettier</li><li>ESLint</li><li>Vetur</li><li>Code Spell Checker</li><li>Debugger for Chrome</li></ul><p>Multiple run configs have been created to facilitate debugging server, client, test and docs.</p><div class="custom-container warning"><p class="custom-container-title">Client certificate authentication doesn&#39;t work in client debugger</p><p>Because Vue cli webpack dev server cannot proxy passthrough HTTPS connections, client certificate authentication doesn&#39;t work in client debugger. If testing client certificate authentication in web console is needed, run <code>npm run build</code> to generate prod client distribution and launch server debugger on https://localhost:3000</p></div><h2 id="automated-testing" tabindex="-1"><a class="header-anchor" href="#automated-testing" aria-hidden="true">#</a> Automated Testing</h2>',7),p=e("em",null,"NotifyBC",-1),m={href:"https://jestjs.io/",target:"_blank",rel:"noopener noreferrer"},b=e("code",null,"npm run test:e2e",-1),f=e("em",null,"Test",-1),g=e("p",null,"Github Actions runs tests as part of the build. All test scripts should be able to run unattended, headless, quickly and depend only on local resources.",-1),_=e("h3",{id:"writing-test-specs",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#writing-test-specs","aria-hidden":"true"},"#"),t(" Writing Test Specs")],-1),v={href:"https://github.com/visionmedia/supertest",target:"_blank",rel:"noopener noreferrer"},k={href:"https://github.com/nodkz/mongodb-memory-server",target:"_blank",rel:"noopener noreferrer"},w=e("em",null,"sendMail",-1),x=e("em",null,"sendSMS",-1),y=a(`<ul><li>start at a processing phase as early as possible. For example, to test a REST end point, start with the HTTP user request.</li><li>assert outcome of a processing phase as late and down below as possible - the HTTP response body/code, the database record created, for example.</li><li>avoid asserting middleware function input/output to facilitate code refactoring.</li><li>mock email/sms sending function (implemented by default). Inspect the input of the function, or at least assert the function has been called.</li></ul><h2 id="install-docs-website" tabindex="-1"><a class="header-anchor" href="#install-docs-website" aria-hidden="true">#</a> Install Docs Website</h2><p>If you want to contribute to <em>NotifyBC</em> docs beyond simple fix ups, run</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> docs <span class="token operator">&amp;&amp;</span> <span class="token function">npm</span> <span class="token function">install</span> <span class="token operator">&amp;&amp;</span> <span class="token function">npm</span> run dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>If everything goes well, the last line of the output will be</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>&gt; VuePress dev server listening at http://localhost:8080/NotifyBC/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,6),C={href:"http://localhost:8080/NotifyBC/",target:"_blank",rel:"noopener noreferrer"},T=e("h2",{id:"publish-version-checklist",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#publish-version-checklist","aria-hidden":"true"},"#"),t(" Publish Version Checklist")],-1),S=e("li",null,[t("update "),e("em",null,"version"),t(" in "),e("em",null,"package.json")],-1),N=e("li",null,[t("update "),e("em",null,"version"),t(),e("em",null,"appVersion"),t(" in "),e("em",null,"helm/Chart.yaml"),t(" (major/minor only)")],-1),V=e("li",null,"create a new Github release",-1);function B(I,P){const s=o("ExternalLinkIcon"),i=o("RouterLink");return l(),c("div",null,[h,e("p",null,[p,t(" uses "),e("a",m,[t("Jest"),n(s)]),t(" test framework bundled in NestJS. To launch test, run "),b,t(". A "),f,t(" launch config is provided to debug in VS Code.")]),g,_,e("p",null,[t("Thanks to "),e("a",v,[t("supertest"),n(s)]),t(" and "),e("a",k,[t("MongoDB In-Memory Server"),n(s)]),t(", test specs can be written to cover nearly end-to-end request processing workflow (only "),w,t(" and "),x,t(" need to be mocked). This allows test specs to anchor onto business requirements rather than program units such as functions or files, resulting in regression tests that are more resilient to code refactoring. Whenever possible, a test spec should be written to")]),y,e("p",null,[t("You can now browse to the local docs site "),e("a",C,[t("http://localhost:8080/NotifyBC"),n(s)])]),T,e("ol",null,[S,N,e("li",null,[t("update "),n(i,{to:"/docs/getting-started/what's-new.html"},{default:d(()=>[t("What's new")]),_:1}),t(" (major/minor only)")]),V])])}const E=r(u,[["render",B],["__file","index.html.vue"]]);export{E as default};
