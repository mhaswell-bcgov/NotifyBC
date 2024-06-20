import{_ as l,r as o,o as p,c,a as e,b as s,d as n,w as i,e as r}from"./app-54117baa.js";const u={},d=e("h1",{id:"bulk-import",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#bulk-import","aria-hidden":"true"},"#"),s(" Bulk Import")],-1),m={href:"https://www.mongodb.com/docs/database-tools/mongoimport/",target:"_blank",rel:"noopener noreferrer"},h=e("em",null,"NotifyBC",-1),f=e("li",null,[s("Software installed "),e("ul",null,[e("li",null,"Node.js"),e("li",null,"Git")])],-1),b=e("em",null,"NotifyBC",-1),v={href:"https://github.com/bcgov/NotifyBC/tree/main/src/utils/bulk-import/sample-subscription.csv",target:"_blank",rel:"noopener noreferrer"},k=e("em",null,"confirmationRequest.sendRequest",-1),_=r(`<p>To run the utility</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone https://github.com/bcgov/NotifyBC.git
<span class="token builtin class-name">cd</span> NotifyBC
<span class="token function">npm</span> i <span class="token operator">&amp;&amp;</span> <span class="token function">npm</span> run build
<span class="token function">node</span> dist/utils/bulk-import/subscription.js <span class="token parameter variable">-a</span> <span class="token operator">&lt;</span>api-url-prefix<span class="token operator">&gt;</span> <span class="token parameter variable">-c</span> <span class="token operator">&lt;</span>concurrency<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>csv-file-path<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Here &lt;csv-file-path&gt; is the path to csv file and &lt;api-url-prefix&gt; is the <em>NotifyBC</em> api url prefix , default to <em>http://localhost:3000/api</em>.</p><p>The script parses the csv file and generates a HTTP post request for each row. The concurrency of HTTP request is controlled by option <em>-c</em> which is default to 10 if omitted. A successful run should output the number of rows imported without any error message</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>success row count = ***
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="field-parsers" tabindex="-1"><a class="header-anchor" href="#field-parsers" aria-hidden="true">#</a> Field Parsers</h3>`,6),g={href:"https://github.com/Keyang/node-csvtojson#custom-parsers",target:"_blank",rel:"noopener noreferrer"},y={href:"https://github.com/bcgov/NotifyBC/tree/main/src/utils/bulk-import/subscription.ts",target:"_blank",rel:"noopener noreferrer"},x=e("em",null,"src/utils/bulk-import/subscription.ts",-1),w=e("em",null,"myCustomIntegerField",-1),C=e("em",null,"colParser",-1),N=r(`<div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>  <span class="token literal-property property">colParser</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>
    <span class="token punctuation">,</span> <span class="token function-variable function">myCustomIntegerField</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">item<span class="token punctuation">,</span> head<span class="token punctuation">,</span> resultRow<span class="token punctuation">,</span> row<span class="token punctuation">,</span> colIdx</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">parseInt</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1);function T(B,I){const t=o("ExternalLinkIcon"),a=o("RouterLink");return p(),c("div",null,[d,e("p",null,[s("To migrate subscriptions from other notification systems, you can use "),e("a",m,[s("mongoimport"),n(t)]),s(". "),h,s(" also provides a utility script to bulk import subscription data from a .csv file. To use the utility, you need")]),e("ul",null,[f,e("li",null,[s("Admin Access to a "),b,s(" instance by adding your client ip to the "),n(a,{to:"/docs/config-adminIpList/"},{default:i(()=>[s("Admin IP List")]),_:1})]),e("li",null,[s("a csv file with header row matching "),n(a,{to:"/docs/api-subscription/#model-schema"},{default:i(()=>[s("subscription model schema")]),_:1}),s(". A sample csv file is "),e("a",v,[s("provided"),n(t)]),s(". Compound fields (of object type) should be dot-flattened as shown in the sample for field "),k])]),_,e("p",null,[s("The utility script takes care of type conversion for built-in fields. If you need to import proprietary fields, by default the fields are imported as strings. To import non-string fields or manipulating json output, you need to define "),e("a",g,[s("custom parsers"),n(t)]),s(" in file "),e("a",y,[x,n(t)]),s(". For example, to parse "),w,s(" to integer, add in the "),C,s(" object")]),N])}const L=l(u,[["render",T],["__file","index.html.vue"]]);export{L as default};
