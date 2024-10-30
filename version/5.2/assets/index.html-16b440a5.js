import{_ as l,r as s,o as r,c as d,a as t,b as e,d as o,w as a,e as i}from"./app-97f4fc0a.js";const u={},h=t("h1",{id:"web-console",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#web-console","aria-hidden":"true"},"#"),e(" Web Console")],-1),p=t("a",{href:"../installation"},"installing",-1),f=t("em",null,"NotifyBC",-1),m=t("em",null,"NotifyBC",-1),b={href:"http://localhost:3000",target:"_blank",rel:"noopener noreferrer"},_=t("p",null,"What you see in web console and what you get from API calls depend on how your requests are authenticated.",-1),y=t("h2",{id:"ip-whitelisting-authentication",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#ip-whitelisting-authentication","aria-hidden":"true"},"#"),e(" Ip whitelisting authentication")],-1),g=t("span",{class:"material-icons"},"verified_user",-1),w=t("p",null,"To see the result of non super-admin requests, you can choose one of the following methods",-1),v=t("ul",null,[t("li",null,"customize admin ip list to omit localhost (127.0.0.1)"),t("li",null,"access web console from another ip not in the admin ip list")],-1),I=t("h2",{id:"client-certificate-authentication",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#client-certificate-authentication","aria-hidden":"true"},"#"),e(" Client certificate authentication")],-1),x=t("em",null,"NotifyBC",-1),A=t("span",{class:"material-icons"},"verified",-1),k=i('<h2 id="anonymous" tabindex="-1"><a class="header-anchor" href="#anonymous" aria-hidden="true">#</a> Anonymous</h2><p>If you access web console from a client that is not in the admin ip list, you are by default anonymous user. Anonymous authentication status is indicated by the LOGIN<span class="material-icons">login</span> button on top right corner of web console. Click the button to login.</p><h2 id="access-token-authentication" tabindex="-1"><a class="header-anchor" href="#access-token-authentication" aria-hidden="true">#</a> Access token authentication</h2>',3),P=t("em",null,"Access Token",-1),C=t("em",null,"Access Token",-1),O=t("span",{class:"material-icons"},"login",-1),S=i('<div class="custom-container warning"><p class="custom-container-title">Tokens are not shared between API Explorer and web console</p><p>Despite API Explorer appears to be part of web console, it is a separate application. At this point neither the access token nor the OIDC access token are shared between the two applications. You have to use API Explorer&#39;s <em>Authorize</em> button to authenticate even if you have logged into web console.</p></div><h2 id="oidc-authentication" tabindex="-1"><a class="header-anchor" href="#oidc-authentication" aria-hidden="true">#</a> OIDC authentication</h2><p>If you have configured OIDC, then the login button will direct you to OIDC provider&#39;s login page. Once login successfully, you will be redirected back to <em>NoitfyBC</em> web console. OIDC authentication status is indicated by the LOGOUT<span class="material-icons">logout</span> button.</p>',3),q=i(`<h2 id="siteminder-authentication" tabindex="-1"><a class="header-anchor" href="#siteminder-authentication" aria-hidden="true">#</a> SiteMinder authentication</h2><p>To get results of a SiteMinder authenticated user, do one of the following</p><ul><li>access the API via a SiteMinder proxy if you have configured SiteMinder properly</li><li>use a tool such as <em>curl</em> that allows to specify custom headers, and supply SiteMinder header <em>SM_USER</em>:</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">-X</span> GET <span class="token parameter variable">--header</span> <span class="token string">&quot;Accept: application/json&quot;</span> <span class="token punctuation">\\</span>
    <span class="token parameter variable">--header</span> <span class="token string">&quot;SM_USER: foo&quot;</span> <span class="token punctuation">\\</span>
    <span class="token string">&quot;http://localhost:3000/api/notifications&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4);function N(T,E){const c=s("ExternalLinkIcon"),n=s("RouterLink");return r(),d("div",null,[h,t("p",null,[e("After "),p,e(),f,e(", you can start exploring "),m,e(" resources by opening web console, a curated GUI, at "),t("a",b,[e("http://localhost:3000"),o(c)]),e(". You can further explore full-blown APIs by clicking the API explorer Swagger UI embedded in web console.")]),t("p",null,[e("Consult the "),o(n,{to:"/docs/api-overview/"},{default:a(()=>[e("API docs")]),_:1}),e(" for valid inputs and expected outcome while you are exploring the APIs. Once you are familiar with the APIs, you can start writing code to call the APIs from either user browser or from a server application.")]),_,y,t("p",null,[e("The API calls you made with API explorer as well as API calls made by web console from localhost are by default authenticated as "),o(n,{to:"/docs/overview/#architecture"},{default:a(()=>[e("super-admin requests")]),_:1}),e(" because localhost is in "),o(n,{to:"/docs/config-adminIpList/"},{default:a(()=>[e("admin ip list")]),_:1}),e(" by default. Ip whitelisting authentication status is indicated by the "),g,e(" icon on top right corner of web console.")]),w,v,I,t("p",null,[e("If your ip is not in the admin ip list but you have setup a client certificate issued by "),x,e(" server in browser, the API calls you made with API explorer as well as API calls made by web console are also authenticated as "),o(n,{to:"/docs/overview/#architecture"},{default:a(()=>[e("super-admin requests")]),_:1}),e(". Client certificate authentication status is indicated by the "),A,e(" icon on top right corner of web console.")]),k,t("p",null,[e("If you have not configured "),o(n,{to:"/docs/config/oidc.html"},{default:a(()=>[e("OIDC")]),_:1}),e(", the login button opens a login form. After successful login, the login button is replaced with the "),P,e(" text field on top right corner of web console. You can edit the text field. If the new access token you entered is invalid, you are essentially logging yourself out. In such case "),C,e(" text field is replaced by the LOGIN"),O,e(" button.")]),t("p",null,[e("The procedure to create an admin login account is documented in "),o(n,{to:"/docs/api/administrator.html"},{default:a(()=>[e("Administrator API")]),_:1})]),S,t("p",null,[e("If you passed "),o(n,{to:"/docs/config/oidc.html"},{default:a(()=>[e("isAdmin")]),_:1}),e(" validation, you are admin; otherwise you are authenticated user.")]),q])}const B=l(u,[["render",N],["__file","index.html.vue"]]);export{B as default};
