const MOBIUS=`
.ft{--ink:var(--text);--paper:var(--bg);--card:var(--surface);--muted:var(--muted);min-height:100%;padding:0;background:var(--bg);color:var(--text);font-family:var(--font);overflow:visible;-webkit-font-smoothing:antialiased}.ft:before,.pipe:after{display:none}.shell{max-width:none}.head{min-height:64px;margin:0;padding:max(10px,env(safe-area-inset-top)) 16px 10px;border-bottom:1px solid var(--border);background:var(--bg)}.brand{gap:10px}.mark{display:grid;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:8px;background:var(--accent-dim);color:var(--text);font-size:21px;box-shadow:none}.brand b{font-family:var(--font);font-size:15px;font-weight:750;letter-spacing:-.02em}.route{margin-top:2px;color:var(--muted);font:500 10px var(--font)}.hint,.foot{color:var(--muted)}.pipe{max-width:1280px;margin:16px auto 0;padding:13px 3% 18px;border:1px solid var(--border);border-radius:14px;background:var(--surface);box-shadow:none;backdrop-filter:none}.pipe:before{height:8px;top:49px;border:0;background:var(--border);box-shadow:none;animation:none}.stage:before{top:35px;height:8px;transition:background .15s}.stage:hover:before,.stage:focus-visible:before,.stage.active:before{background:var(--accent);box-shadow:none}.dot{width:58px;height:58px;border:1px solid var(--border);background:var(--surface-2,var(--surface));color:var(--muted);text-shadow:none;box-shadow:none;font-size:11px}.label{min-height:64px;padding:11px 9px;border:1px solid var(--border);border-radius:10px;background:var(--bg);box-shadow:none;color:var(--text)}.label b{font-family:var(--font);font-size:12px;font-weight:700}.label span{margin-top:5px;color:var(--muted)}.stage:hover .dot,.stage:focus-visible .dot,.stage.active .dot{transform:none;border-color:var(--accent);background:var(--accent);color:var(--accent-fg);box-shadow:none}.stage:hover .label,.stage:focus-visible .label,.stage.active .label{transform:none;border-color:color-mix(in srgb,var(--accent) 55%,var(--border));background:color-mix(in srgb,var(--accent) 10%,var(--surface));box-shadow:none}.stage:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:10px}.stage.done .dot:after{width:17px;height:17px;margin:39px 0 0 39px;border:1px solid var(--border);background:var(--bg);color:var(--accent);box-shadow:none}.body{max-width:1280px;margin:12px auto 0;gap:12px}.panel{min-height:500px;padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--surface);box-shadow:none;backdrop-filter:none}.panel h2{font-family:var(--font);font-size:clamp(24px,3vw,34px);font-weight:750;letter-spacing:-.035em}.step{color:var(--accent)}.panelhead p,.help,.note{color:var(--muted)}.drop{border:1px dashed color-mix(in srgb,var(--accent) 55%,var(--border));border-radius:12px;background:color-mix(in srgb,var(--accent) 5%,var(--surface));color:var(--text);box-shadow:none}.drop:hover,.drop.drag{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));box-shadow:none}.drop i{background:var(--accent);color:var(--accent-fg);box-shadow:none}.file,.tabs button,.field input,.field textarea,.field select,.choice,.summary article,.connect,.secondary,.telemetry-status article,.chart-card,.event-log{border-color:var(--border);background:var(--bg);color:var(--text)}.file>span{background:var(--accent-dim);color:var(--accent)}.empty{border-color:var(--border);color:var(--muted)}.tabs button.active{border-color:var(--accent);background:var(--accent);color:var(--accent-fg);box-shadow:none}.field input:focus,.field textarea:focus,.field select:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}.choice.selected{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 9%,var(--surface));box-shadow:none}.choice.selected:after{color:var(--accent)}.rec{background:var(--accent)!important;color:var(--accent-fg)!important}.preview{border:1px solid var(--border);background:var(--bg);color:var(--text)}.connect:hover,.connect:focus-visible{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--surface));box-shadow:none}.train{background:var(--accent);color:var(--accent-fg);box-shadow:none;animation:none}.train:hover{transform:none;background:var(--accent-hover,var(--accent));box-shadow:none}.train:active{transform:none;opacity:.78;box-shadow:none}.ft-chat{min-height:500px;border:1px solid var(--border);border-radius:14px;background:var(--bg);box-shadow:none;overflow:hidden}.ft-chat-mount{min-height:500px}.ft-chat-note{inset:0;background:var(--bg);color:var(--muted)}.foot{max-width:1280px;margin:12px auto 16px;padding:0 2px}@media(max-width:1312px){.pipe,.body,.foot{margin-left:16px;margin-right:16px}}@media(max-width:900px){.pipe:before{left:37px;top:42px;bottom:42px;width:8px;height:auto}.stage:before{left:33px;width:8px}.dot{width:50px;height:50px}.stage.done .dot:after{margin:34px 0 0 34px}.label{min-height:54px}.body{grid-template-columns:1fr}.panel{padding:20px}}@media(max-width:540px){.pipe,.body,.foot{margin-left:12px;margin-right:12px}.head{padding-left:12px;padding-right:12px}.panel{padding:16px}}
.pipe{grid-template-columns:repeat(4,1fr);background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 3%,var(--surface)),var(--surface))}.pipe:before{background:linear-gradient(90deg,var(--accent) 0 25%,var(--border) 44%);box-shadow:0 0 10px color-mix(in srgb,var(--accent) 16%,transparent)}.dot{position:relative}.stage.active .dot{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}.stage.done:not(.active) .dot{border:2px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--surface));color:var(--text);box-shadow:inset 0 0 0 3px var(--bg)}.stage.done .dot:after{display:none}.stage.done:not(.active) .dot{color:var(--accent)}.donecheck{width:22px;height:22px;stroke-width:3}.datahead{margin-top:26px;padding-top:24px;border-top:1px solid var(--border)}.connection-note{margin:10px 2px 0}.pipe,.panel{position:relative}.pipe{overflow:hidden}.pipe:after{content:'';display:block;position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 18%,color-mix(in srgb,var(--accent) 5%,transparent) 48%,transparent 78%)}

@media(max-width:900px){.pipe{grid-template-columns:1fr}}
.route{font-size:12px}.label{display:grid;place-items:center;min-height:52px;padding:10px}.label b{font-size:14px}.dot{font-size:12px}.panelhead p{font-size:14px;line-height:1.5}.drop b{font-size:15px}.drop span,.help{font-size:13px;line-height:1.45}.file b{font-size:14px}.file small{font-size:12px}.tabs button{font-size:14px}.field label{font-size:12px}.field input,.field textarea,.field select{font-size:14px}.choice b{font-size:14px}.choice span{font-size:13px}.summary small{font-size:11px}.summary b{font-size:18px}.summary span{font-size:12px}.connecttitle{font-size:12px}.connect b{font-size:14px}.connect span,.note{font-size:12px;line-height:1.45}.previewhead{font-size:12px}.preview pre{font-size:12px}.empty{font-size:13px}.foot{display:none}

.pipe{grid-template-columns:repeat(6,1fr)}.catalog{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;padding:15px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}.catalog div b,.catalog div span{display:block}.catalog div b{font-size:14px}.catalog div span{margin-top:5px;color:var(--muted);font-size:13px}.catalog-empty{margin-top:0}.method-note{margin:14px 2px 0}.connects:has(.connect:nth-child(2)){grid-template-columns:repeat(2,1fr)}@media(max-width:900px){.pipe{grid-template-columns:1fr}.catalog{align-items:stretch;flex-direction:column}}
.providers-simple .choice{min-height:72px}.provider-row{display:grid;margin-top:14px;border:1px solid var(--border);border-radius:8px;background:var(--surface);overflow:hidden}.provider-row__main{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:9px 11px}.provider-row__main b,.provider-row__main span{display:block}.provider-row__main b{font-size:14px;font-weight:500;line-height:1.3}.provider-row__main span{margin-top:3px;color:var(--muted);font-size:12.5px}.provider-row__main i{display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:var(--muted)}.provider-row__main i.connected{background:#54b986}.provider-row__action{min-width:76px;padding:6px 12px;border:1px solid var(--border);border-radius:7px;background:var(--bg);color:var(--text);font-size:13px;cursor:pointer}.provider-row__action:hover,.provider-row__action:focus-visible{border-color:var(--accent)}.provider-auth{display:grid;gap:8px;padding:12px;border-top:1px solid var(--border)}.provider-auth p,.provider-row>p{margin:0;padding:0 12px 10px;color:var(--muted);font-size:13px}.provider-auth p{padding:0}.provider-auth p a{color:var(--text);text-decoration:underline;text-underline-offset:3px}.provider-auth label{font-size:12px;font-weight:700}.provider-auth input{width:100%;min-height:40px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:var(--bg);color:var(--text);outline:none}.provider-auth input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}.provider-auth>div{display:flex;align-items:center;gap:9px}.provider-auth button,.provider-auth a{padding:7px 12px;border:1px solid var(--border);border-radius:7px;background:var(--bg);color:var(--text);font-size:13px;text-decoration:none}.provider-auth button{border-color:var(--accent);cursor:pointer}.provider-auth button:disabled{opacity:.55;cursor:not-allowed}.provider-auth a:hover,.provider-auth a:focus-visible{border-color:var(--accent)}.connect-error{display:block;color:#e2776b;font-size:12px}

/* One continuous, non-blocking pipeline rail. */
.pipe{padding:18px 3% 14px;overflow:hidden}.pipe:before{left:10%;right:10%;top:38px;height:4px;border:0;border-radius:99px;background:var(--border)}.pipe:after{content:'';display:block;position:absolute;left:10%;right:10%;top:38px;height:4px;border-radius:99px;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--accent) 24%,transparent) 20%,var(--accent) 50%,color-mix(in srgb,var(--accent) 24%,transparent) 80%,transparent 100%);opacity:.82;pointer-events:none}.stage{gap:10px;padding:0 6px}.stage:before{display:none!important}.dot{z-index:1;width:44px;height:44px;border:2px solid var(--border);background:var(--surface);color:var(--muted);font-size:11px}.label{min-height:0;padding:7px 4px;border:0;border-radius:7px;background:transparent;box-shadow:none}.label b{font-size:13px}.stage.done .dot{border-color:color-mix(in srgb,var(--accent) 78%,var(--border));background:color-mix(in srgb,var(--accent) 8%,var(--surface));color:var(--accent)}.stage.done .dot:after{display:none}.donecheck{width:18px;height:18px}.stage:hover .dot,.stage:focus-visible .dot{transform:none;border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 12%,transparent)}.stage.active .dot{transform:none;border-color:var(--accent);background:var(--accent);color:var(--accent-fg);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 16%,transparent)}.stage:hover .label,.stage:focus-visible .label,.stage.active .label{transform:none;border:0;background:transparent;box-shadow:none}.stage.active .label{color:var(--accent)}
/* Fill the host surface instead of constraining the workspace to a narrow canvas. */
.ft{width:100%;min-height:100vh;min-height:100svh;min-height:100dvh;display:flex}.shell{width:100%;min-height:100vh;min-height:100svh;min-height:100dvh;display:flex;flex:1;flex-direction:column}.pipe,.body,.foot{max-width:none}.body{width:calc(100% - 32px);flex:1;grid-template-columns:minmax(0,1.45fr) minmax(360px,1fr);align-items:stretch}.panel,.ft-chat{min-height:calc(100dvh - 200px)}

/* A compact two-row step rail keeps the working area visible on a phone. */
@media(max-width:900px){.pipe{grid-template-columns:repeat(3,minmax(0,1fr));padding:12px;gap:6px}.pipe:before,.pipe:after{display:none}.stage{grid-template-columns:1fr;justify-items:center;gap:5px;min-height:72px;padding:0}.dot{width:42px;height:42px}.label{place-items:center;min-height:22px;padding:0 3px;text-align:center}.label b{font-size:12px}.body{width:calc(100% - 32px);min-height:0;grid-template-columns:1fr}.panel{min-height:calc(100dvh - 236px)}.ft-chat{min-height:500px}}
@media(max-width:540px){.body{width:calc(100% - 24px)}.panel{min-height:calc(100dvh - 220px)}}


/* Keep the app header and pipeline, but size the work area below Möbius chrome. */
.ft{height:calc(100dvh - 56px);min-height:0;display:flex;overflow:hidden}.shell{height:100%;min-height:0;display:flex;flex:1;flex-direction:column}.head,.pipe{flex:0 0 auto}.body{min-height:0;flex:1;overflow:hidden}.panel,.ft-chat{height:100%;min-height:0;overflow:auto}.ft-chat-mount{min-height:100%}
@media(max-width:900px){.body{overflow:auto}.panel{height:auto;min-height:500px}.ft-chat{height:500px;min-height:500px}}

/* Method choices and select controls remain readable at every available width. */
.method-choices{grid-template-columns:repeat(auto-fit,minmax(190px,1fr));align-items:stretch}.method-choice{min-height:120px;height:auto}.method-choice b{overflow-wrap:anywhere}.stage,.label,.tabs button,.secondary,.provider-row__action{min-width:0;max-width:100%}.label b{overflow-wrap:anywhere}.field select,.parameter select,.sweep select{min-width:0;max-width:100%;padding-right:38px!important;overflow:hidden;text-overflow:ellipsis;background-position:right 12px center}
@media(max-width:540px){.method-choices{grid-template-columns:1fr}.method-choice{min-height:104px}}

/* Data starts with one intentional source choice, then exposes only that path. */
.data-source-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.data-source-choices button{display:grid;gap:7px;min-height:112px;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);text-align:left;cursor:pointer}.data-source-choices button:hover,.data-source-choices button:focus-visible{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--surface));outline:none}.data-source-choices b{font-size:15px}.data-source-choices span{color:var(--muted);font-size:12px;line-height:1.4}.data-change{align-self:start}.data-goal{margin-top:18px}.dataset-preview{margin-top:14px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}.dataset-preview>div:last-child{display:grid;grid-template-columns:120px 1fr;gap:7px 12px;font-size:13px;line-height:1.45}.dataset-preview strong{color:var(--muted);font-size:11px;text-transform:uppercase}.dataset-preview p{margin:0}.data-ready-preview{margin-top:14px}.data-review{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:16px;padding:13px 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}.data-review.confirmed{border-color:color-mix(in srgb,var(--accent) 70%,var(--border));background:color-mix(in srgb,var(--accent) 7%,var(--surface))}.data-review b,.data-review span{display:block}.data-review b{font-size:13px}.data-review span{margin-top:4px;color:var(--muted);font-size:12px;line-height:1.4}.data-review .secondary{flex:0 0 auto}
@media(max-width:700px){.data-source-choices{grid-template-columns:1fr}.data-source-choices button{min-height:72px}.dataset-preview>div:last-child{grid-template-columns:1fr}.data-review{align-items:stretch;flex-direction:column}.data-review .secondary{width:100%;justify-content:center}}

/* mobius-ui:Header — app-owned native header treatment. */
.tk-header{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:12px 16px;background:var(--surface);border-bottom:1px solid var(--border)}.tk-brand{display:flex;align-items:center;gap:11px;min-width:0}.tk-mark{flex:0 0 auto;display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent)}.tk-mark{font-size:19px;line-height:1}.tk-brand-text{min-width:0;line-height:1.15}.tk-brand-text h1{margin:0;font-family:var(--font);font-size:18px;font-weight:700;letter-spacing:-.015em}.tk-brand-text span{display:block;margin-top:2px;color:var(--muted);font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.panel h2{font-family:var(--font);font-size:24px;font-weight:700;letter-spacing:-.02em}.step{font-size:11px;letter-spacing:.07em}.hf-search{align-items:stretch}.hf-search input{min-width:0;min-height:44px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-family:var(--font);font-size:16px;line-height:1.5}.hf-search input::placeholder{color:var(--muted)}.hf-search input:focus{outline:0;border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}.hf-search .secondary{min-width:92px;justify-content:center;background:var(--surface);color:var(--text);font-size:14px;font-weight:600}.hf-result{min-width:0;border-color:var(--border);background:var(--surface);color:var(--text);font-family:var(--font);font-size:14px}.hf-result:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--border));background:color-mix(in srgb,var(--accent) 8%,var(--surface))}.hf-result b{font-size:14px;font-weight:650;overflow-wrap:anywhere}.hf-result span{font-size:12px;color:var(--muted)}.hf-result>span{flex:0 0 auto;color:var(--accent);font-weight:650}.linked{border-color:var(--border);background:var(--surface)}@media(max-width:540px){.tk-header{padding-left:12px;padding-right:12px}.tk-brand-text span{max-width:260px}.hf-search .secondary{width:auto;min-width:0}}
/* UI consistency pass (2026-10-10): one font, theme colours only, top-aligned cards, inline arrows. */
.tk-route{display:flex!important;align-items:center;gap:0;flex-wrap:nowrap}
.tk-arrow{flex:0 0 auto;width:14px;height:14px;margin:0 5px;color:var(--muted);vertical-align:middle}
.tk-steps{display:flex;flex-wrap:wrap;align-items:center;row-gap:4px}
.tk-steps a{margin:0}
.dot{font-family:var(--font)!important;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}
.label{line-height:1.2}
/* Panel heading: action sits beside the title on wide screens and below with spacing on narrow ones. */
.panelhead{display:flex!important;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 16px}
.panelhead>div{min-width:0}
.panel h2{line-height:1.15}
/* Every buttons-as-cards variant keeps its content at the top-left. */
.choice,.method-choice,.data-source-choices button{display:flex!important;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:6px;text-align:left}
.choice{min-height:96px;padding:16px 44px 16px 16px;border-radius:12px}
.providers-simple .choice{min-height:0}
.method-choice{min-height:96px}
.choice b{padding-right:0;font-size:15px;font-weight:650;line-height:1.3}
.choice span{margin-top:0}
.choice .rec{margin-top:4px!important;padding:3px 8px;font-size:10px!important;font-weight:700;letter-spacing:.04em;line-height:1.4}
.choice.selected:after{content:'';top:16px;right:16px;width:16px;height:16px;border-radius:50%;background:var(--accent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.2l2.3 2.3 4.7-4.9' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/16px no-repeat}
/* Selects: one chevron, inset inside the field like the other controls. */
.field select,.parameter select,.sweep select{appearance:none;-webkit-appearance:none;padding-right:40px!important;background:var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") right 14px center/16px no-repeat!important;color:var(--text)}
.field select,.field input,.field textarea,.parameter input,.parameter select,.sweep-row input,.hf-search input{border:1px solid var(--border);border-radius:10px;background-color:var(--bg);color:var(--text);font-family:var(--font)}
.parameter input,.parameter select{min-height:44px;padding:10px 12px}
.parameter label,.field label,.parameter-head h3,.sweep-row label{color:var(--muted);font-family:var(--font);font-size:12px;font-weight:650;letter-spacing:.05em}
.parameter-head h3{font-size:12px}
.parameter-box{border-top-color:var(--border)}
/* Buttons: same face everywhere, centred text. */
.secondary{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:0 16px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);font-family:var(--font);font-size:14px;font-weight:600;line-height:1;cursor:pointer}
.secondary:hover:not(:disabled),.secondary:focus-visible{border-color:var(--accent);outline:none}
.secondary:disabled{opacity:.55;cursor:default}
.secondary.primaryish{border-color:var(--accent);background:var(--accent);color:var(--accent-fg)}
.btn-icon{width:16px;height:16px}
.train{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 22px;border-radius:10px;font-family:var(--font);font-size:14px;font-weight:650;letter-spacing:0}
.data-review-actions{display:flex;flex-wrap:wrap;gap:8px;flex:0 0 auto}
/* Review summary: same type as the rest of the app, no orphaned card. */
.summary{grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))!important}
.summary article{border-color:var(--border);border-radius:12px;background:var(--bg)}
.summary small{color:var(--muted);font-size:12px;font-weight:650;letter-spacing:.05em}
.summary b{margin:8px 0 4px;font-family:var(--font);font-size:17px;font-weight:650;overflow-wrap:anywhere}
.summary span{color:var(--muted);font-size:13px}
.provider-row__main b{font-weight:650}
/* Remove leftover light-theme surfaces. */
.hf-result,.charts-loading,.telemetry-status article,.event-log,.file,.linked,.preview,.dataset-preview{border-color:var(--border);background:var(--bg);color:var(--text)}
.event-log li{border-bottom-color:var(--border)}
.linked{border-color:color-mix(in srgb,var(--accent) 55%,var(--border))}
.preview pre{color:var(--text)}
.previewhead{color:var(--muted);font-weight:650;letter-spacing:.05em}
.sweep{border-color:color-mix(in srgb,var(--accent) 55%,var(--border));background:color-mix(in srgb,var(--accent) 6%,var(--surface))}
.sweep-head b,.switch{color:var(--text)}
.chart-card{background:var(--bg);box-shadow:none}
.chart-expand{border-color:var(--border)}
.telemetry-status small,.chart-kpis small,.chart-count,.chart-legend,.note,.source-stamp{font-size:12px}
@media(max-width:700px){.data-review-actions{width:100%}
.data-review-actions .secondary{flex:1 1 0;width:auto}
.actions .train{width:100%}
}
.split-card{display:grid;gap:10px;margin-top:12px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}
.split-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.split-head b{font-size:14px}
.split-head span,.split-card small{color:var(--muted);font-size:12px}
.split-bar{height:6px;border-radius:99px;background:color-mix(in srgb,var(--accent) 30%,var(--border));overflow:hidden}
.split-bar i{display:block;height:100%;background:var(--accent)}
.split-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.split-stats span{display:grid;gap:2px;color:var(--muted);font-size:12px}
.split-stats strong{color:var(--text);font-size:16px;font-weight:650;font-variant-numeric:tabular-nums}
@media(max-width:540px){.split-stats{grid-template-columns:1fr 1fr}}
.data-review.confirmed{border-color:color-mix(in srgb,#3fb97a 60%,var(--border));background:color-mix(in srgb,#3fb97a 8%,var(--surface))}
.data-review.rejected{border-color:color-mix(in srgb,#e2776b 55%,var(--border))}
.secondary.confirmed-btn{border-color:#2f9e63;background:#2f9e63;color:#fff;cursor:default;pointer-events:none}
.secondary.confirmed-btn:hover:not(:disabled),.secondary.confirmed-btn:focus-visible{border-color:#3fb97a;background:#36ad6e}
.method-desc{color:var(--muted);font-size:13px;line-height:1.4}
.run-card{display:grid;gap:8px;margin-top:14px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}
.run-card.run-running,.run-card.run-pending,.run-card.run-uploading,.run-card.run-preparing,.run-card.run-requested{border-color:color-mix(in srgb,var(--accent) 55%,var(--border))}
.run-card.run-completed{border-color:color-mix(in srgb,#3fb97a 60%,var(--border))}
.run-card.run-failed,.run-card.run-cancelled{border-color:color-mix(in srgb,#e2776b 60%,var(--border))}
.run-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.run-head b{font-size:14px}.run-head span{color:var(--muted);font-size:13px;font-variant-numeric:tabular-nums}
.run-card small{color:var(--muted);font-size:12px;overflow-wrap:anywhere}
.run-link{color:var(--accent);font-size:13px;text-decoration:none}
.train-confirm{display:grid;gap:8px;margin-top:16px;padding:16px;border:1px solid color-mix(in srgb,var(--accent) 55%,var(--border));border-radius:12px;background:color-mix(in srgb,var(--accent) 6%,var(--surface))}
.train-confirm b{font-size:15px}.train-confirm p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}
.train:disabled{opacity:.5;cursor:not-allowed}
.lora-note{margin-top:14px}.lora-note b{color:var(--text)}
.live-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-bottom:14px;color:var(--muted);font-size:13px}
.live-pill{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;border:1px solid color-mix(in srgb,#3fb97a 55%,var(--border));border-radius:99px;background:color-mix(in srgb,#3fb97a 12%,transparent);color:#5fd394;font-size:13px;font-weight:650}
.ended-pill{display:inline-flex;align-items:center;padding:4px 10px;border:1px solid var(--border);border-radius:99px;font-size:13px;font-weight:650;color:var(--text)}
.ended-pill.bad{border-color:color-mix(in srgb,#e2776b 55%,var(--border));color:#e2776b}
.live-pill i,.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#3fb97a;box-shadow:0 0 0 0 rgba(63,185,122,.6);animation:tk-pulse 1.6s ease-out infinite}
.live-dot{margin-right:8px;vertical-align:middle}
@keyframes tk-pulse{0%{box-shadow:0 0 0 0 rgba(63,185,122,.55)}70%{box-shadow:0 0 0 7px rgba(63,185,122,0)}100%{box-shadow:0 0 0 0 rgba(63,185,122,0)}}
@media(prefers-reduced-motion:reduce){.live-pill i,.live-dot{animation:none}}
.pipe{grid-template-columns:repeat(7,minmax(0,1fr))!important}
@media(max-width:900px){.pipe{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
.eval-intro{margin:-8px 0 16px;font-size:13px;line-height:1.5}
.eval-controls{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px}
.eval-controls .field{flex:1 1 220px}
.eval-summary{margin-top:16px}
.eval-summary b.up{color:#5fd394}.eval-summary b.down{color:#e2776b}
.eval-list{display:grid;gap:8px;margin-top:16px}
.eval-item{border:1px solid var(--border);border-radius:12px;background:var(--bg)}
.eval-item summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;cursor:pointer;list-style:none}
.eval-item summary::-webkit-details-marker{display:none}
.eval-q{min-width:0;overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}
.eval-scores{display:flex;flex:0 0 auto;gap:6px}
.eval-scores i{padding:2px 8px;border:1px solid var(--border);border-radius:99px;color:var(--muted);font-size:12px;font-style:normal}
.eval-scores i.up{border-color:color-mix(in srgb,#3fb97a 55%,var(--border));color:#5fd394}
.eval-scores i.down{border-color:color-mix(in srgb,#e2776b 55%,var(--border));color:#e2776b}
.eval-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:0 14px 14px}
.eval-cols small{display:block;margin-bottom:4px;color:var(--muted);font-size:11px;font-weight:650;letter-spacing:.05em;text-transform:uppercase}
.eval-cols p{margin:0;font-size:13px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
@media(max-width:700px){.eval-cols{grid-template-columns:1fr}}
.stop-btn{border-color:color-mix(in srgb,#e2776b 60%,var(--border))!important;color:#e2776b!important}
.stop-confirm{display:grid;gap:8px}.stop-confirm p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}
.weights{display:grid;gap:8px;margin-top:14px;padding:14px;border:1px solid color-mix(in srgb,#3fb97a 50%,var(--border));border-radius:12px;background:var(--bg)}
.weights>b{font-size:14px}
.weight-row strong,.weight-row span{display:block}.weight-row strong{font-size:14px}
.weight-row span{margin-top:3px;color:var(--muted);font-size:12px;overflow-wrap:anywhere}
.mono{font-family:ui-monospace,monospace}
.chunk-field{margin-top:16px}
.run-name{display:flex;align-items:baseline;gap:10px}.run-name strong{font-size:15px;overflow-wrap:anywhere}
.link-btn{padding:0;border:0;background:none;color:var(--accent);font:inherit;font-size:13px;cursor:pointer}
.rename-row{display:flex;flex-wrap:wrap;gap:8px}.rename-row input{flex:1 1 200px;min-height:40px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font:inherit}
.field input#run-label{min-height:44px}
.eval-explain{margin-top:16px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg);font-size:13px;line-height:1.5}
.eval-explain ul{margin:8px 0 0;padding-left:18px;color:var(--muted)}.eval-explain strong{color:var(--text)}
.verdict{display:grid;gap:6px;margin-top:16px;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}
.verdict small{color:var(--muted);font-size:12px;font-weight:650;letter-spacing:.05em;text-transform:uppercase}
.verdict b{font-size:17px;line-height:1.35}.verdict p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}
.verdict-better{border-color:color-mix(in srgb,#3fb97a 60%,var(--border))}.verdict-worse{border-color:color-mix(in srgb,#e2776b 60%,var(--border))}
.bench{margin-top:16px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)}
.bench-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 12px;margin-bottom:10px}
.bench-head b{font-size:15px}.bench-head span{color:var(--muted);font-size:12px}
.eval-list-head{margin-top:18px}
.bench table{width:100%;border-collapse:collapse;font-size:13px}
.bench th{padding:6px 8px;border-bottom:1px solid var(--border);color:var(--muted);font-size:11px;font-weight:650;letter-spacing:.05em;text-align:left;text-transform:uppercase}
.bench td{padding:9px 8px;border-bottom:1px solid var(--border);font-variant-numeric:tabular-nums}
.bench td i{margin-left:6px;font-size:12px;font-style:normal;color:var(--muted)}.bench td i.up{color:#5fd394}.bench td i.down{color:#e2776b}
.bench td.ref{color:var(--muted)}.bench td.na{color:var(--muted);font-size:12px}
.bench .note a{color:var(--accent)}
.live-name{color:var(--text);font-size:14px}
.ft-chat-launch{flex:0 0 auto;min-height:36px;padding:0 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.ft-chat-launch:hover:not(:disabled){border-color:var(--accent)}.ft-chat-launch:disabled{opacity:.6;cursor:default}
.eval-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:-2px 0 10px;color:var(--muted);font-size:12px}
.eval-legend span{display:inline-flex;align-items:center;gap:6px}
.eval-legend i{width:10px;height:10px;border-radius:3px;background:var(--border)}
.eval-legend i.up{background:#3fb97a}.eval-legend i.down{background:#e2776b}
.verdict-line{margin:0;color:var(--text)!important;font-size:14px!important;font-variant-numeric:tabular-nums}
.verdict-running b{font-size:15px}
.panel{overflow-x:hidden}
.eval-controls,.eval-controls .field,.eval-controls select,.bench,.verdict,.eval-list,.eval-item,.eval-item summary{min-width:0;max-width:100%}
.eval-controls select{width:100%;text-overflow:ellipsis}
.bench table{table-layout:fixed}
.bench th,.bench td{overflow-wrap:anywhere;word-break:break-word;vertical-align:top}
.bench th:first-child,.bench td:first-child{width:34%}
.verdict-line,.verdict small,.eval-legend span,.bench-head span{overflow-wrap:anywhere}
.eval-q{flex:1 1 auto}
@media(max-width:700px){.bench th{font-size:10px;letter-spacing:.02em}.bench td{padding:8px 6px;font-size:12px}.eval-controls .train,.eval-controls .secondary{flex:1 1 auto}}
.partial-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;color:#e8b04a;font-size:13px;font-weight:600}
.bench-source{margin-top:12px}.bench-source input{min-height:44px}
.ref-table{margin-top:14px}.ref-table small{display:block;margin-bottom:6px;color:var(--muted);font-size:12px;overflow-wrap:anywhere}
.ref-table table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}
.ref-table th,.ref-table td{padding:6px;border-bottom:1px solid var(--border);text-align:left;overflow-wrap:anywhere;color:var(--muted)}
.ref-table th{font-size:10px;letter-spacing:.04em;text-transform:uppercase}
/* Pipeline: Roster-style night canvas (soft glows, faint grid, ringed nodes, frosted pill labels). */
.pipe{border-color:rgba(125,101,255,.22)!important;background:
 radial-gradient(60% 120% at 12% 0%,rgba(79,51,220,.22),transparent 60%),
 radial-gradient(50% 110% at 92% 100%,rgba(46,200,170,.10),transparent 60%),
 linear-gradient(180deg,#0d0e1a,#090a12)!important}
.pipe:before{background-image:radial-gradient(rgba(150,140,255,.16) 1px,transparent 1.2px)!important;background-size:26px 26px!important;opacity:.7}
.dot{border-color:rgba(125,101,255,.28)!important;background:rgba(10,11,20,.85)!important;box-shadow:0 0 0 5px rgba(125,101,255,.06),0 0 18px rgba(79,51,220,.12)!important}
.stage.done:not(.active) .dot{border-color:rgba(140,118,255,.75)!important;background:rgba(18,16,36,.9)!important;box-shadow:0 0 0 5px rgba(125,101,255,.08),0 0 20px rgba(103,84,231,.28)!important}
.stage.active .dot{box-shadow:0 0 0 6px rgba(125,101,255,.18),0 0 30px rgba(103,84,231,.55)!important}
.stage:hover .dot,.stage:focus-visible .dot{box-shadow:0 0 0 6px rgba(125,101,255,.14),0 0 26px rgba(103,84,231,.4)!important}
.label{padding:3px 11px!important;border:1px solid rgba(125,101,255,.18)!important;border-radius:999px!important;background:rgba(8,10,18,.6)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.label b{font-size:10px!important;font-weight:760!important;letter-spacing:.12em;text-transform:uppercase;color:#a9adbb}
.stage.done:not(.active) .label b{color:#d6d3f5}
.stage.active .label{border-color:rgba(140,118,255,.6)!important;box-shadow:0 0 22px rgba(103,84,231,.22)}
.stage.active .label b{color:#fff!important}
.stage.active .dot{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--accent-fg,#fff)!important}
.label{width:auto!important;max-width:100%;justify-self:center;min-height:0!important}
.pipe{border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
.pipe{overflow:visible!important}
/* Connector line between steps (desktop: one rail; narrow screens: a link between neighbours in each row). */
@media(min-width:901px){.pipe:before{display:block!important;background:rgba(125,101,255,.28)!important;background-image:none!important;opacity:1!important;-webkit-mask-image:none;mask-image:none}
.pipe:after{display:block!important}}
@media(max-width:900px){.pipe .stage:before{display:block!important;content:'';position:absolute;z-index:0;top:20px;left:calc(-50% + 24px)!important;right:calc(50% + 24px)!important;width:auto!important;bottom:auto!important;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(125,101,255,.55),rgba(125,101,255,.3))!important;box-shadow:0 0 8px rgba(103,84,231,.35)!important}
.pipe .stage:nth-child(4n+1):before{display:none!important}
.pipe .dot{position:relative;z-index:1}}

/* Method data spec + model serverless badges */
.data-spec{margin-top:18px;padding-top:16px;border-top:1px solid var(--border)}.data-spec.compact{margin-top:10px;padding-top:0;border:0}
.spec-format{color:var(--muted);font-size:11px}
.data-spec dl{display:grid;gap:6px;margin:0 0 12px}.data-spec dl div{display:grid;grid-template-columns:minmax(110px,.3fr) 1fr;gap:10px;font-size:12px;line-height:1.45}.data-spec dt{font:600 11px ui-monospace,monospace;color:var(--accent)}.data-spec dd{margin:0;color:var(--muted)}
.spec-preview{min-height:0}.spec-preview pre{max-height:180px}
.spec-strip{margin-bottom:16px;padding:11px 14px;border:1px solid color-mix(in srgb,var(--accent) 30%,var(--border));border-radius:12px;background:color-mix(in srgb,var(--accent) 5%,var(--surface))}.spec-strip summary{cursor:pointer;font-size:12px;color:var(--muted)}.spec-strip summary b{color:var(--text);margin-right:6px}
.model-legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin-bottom:12px;color:var(--muted);font-size:11px}.model-legend span{display:flex;align-items:center;gap:6px}.model-legend i{width:9px;height:9px;border-radius:50%}
.model-legend i.badge-serverless{background:#3fb98a}.model-legend i.badge-tuned{background:var(--accent)}
.model-list{display:grid;gap:6px}
.model-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:inherit;text-align:left;cursor:pointer}
.model-row:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--border))}
.model-row.selected{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}
.model-name{display:grid;gap:2px;min-width:0}.model-name b{font-size:13px;overflow-wrap:anywhere}.model-name small{color:var(--muted);font-size:10px}
.model-badges{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px}
.model-badges em{padding:3px 8px;border-radius:99px;font-style:normal;font-size:10px;font-weight:650;white-space:nowrap}
.model-badges .badge-serverless{background:rgba(63,185,138,.14);color:#3fb98a;border:1px solid rgba(63,185,138,.35)}
.model-badges .badge-tuned{background:color-mix(in srgb,var(--accent) 14%,transparent);color:color-mix(in srgb,var(--accent) 70%,#fff);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}
.model-badges .badge-none{color:var(--muted);border:1px solid var(--border)}
@media(max-width:540px){.model-row{flex-direction:column;align-items:flex-start}.model-badges{justify-content:flex-start}.data-spec dl div{grid-template-columns:1fr;gap:2px}}
.spec-when{margin:0 0 8px;font-size:12px;line-height:1.55;color:var(--muted)}.spec-when b{color:var(--text)}
.spec-rules{margin:0 0 12px;padding-left:18px;color:var(--muted);font-size:12px;line-height:1.6}
/* ---------------- Step-card setup (dark) ---------------- */
.fw{display:grid;gap:14px}
.fw-card{border:1px solid var(--border);border-radius:18px;background:color-mix(in srgb,var(--surface) 92%,#fff 2%);transition:border-color .15s}
.fw-card.open{border-color:color-mix(in srgb,var(--accent) 35%,var(--border))}
.fw-head{display:flex;align-items:center;gap:14px;width:100%;padding:20px 22px;cursor:pointer;color:var(--text);user-select:none}
.fw-head b{font-size:17px;font-weight:650;letter-spacing:-.01em}
.fw-num{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--accent-fg,#fff);font-size:13px;font-weight:700}
.fw-num.done{background:#2f9e6e}.fw-num svg{width:16px;height:16px}
.fw-sum{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.fw-learn{margin-left:auto;color:color-mix(in srgb,var(--accent) 75%,#fff);font-size:13px;text-decoration:none}.fw-learn:hover{text-decoration:underline}
.fw-chev{flex:none;width:18px;height:18px;color:var(--muted);transition:transform .15s}.fw-chev.up{transform:rotate(180deg)}.fw-sum+.fw-chev{margin-left:10px}.fw-head>b+.fw-chev{margin-left:auto}
.fw-body{display:grid;gap:14px;padding:0 22px 22px}
.fw-lead{margin:0;color:var(--text);font-size:14px}
.fw-muted{color:var(--muted)}.fw-small{margin:0;font-size:12px;line-height:1.5}.fw-pad{padding:12px}
.fw-label{font-size:13px;font-weight:600;color:var(--text)}
.fw-input{width:100%;min-height:46px;padding:0 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:inherit;font-size:14px}
.fw-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.fw-nav{display:flex;justify-content:flex-end;gap:10px;margin-left:auto}
.fw-btn{min-height:44px;padding:0 20px;border-radius:12px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text)}
.fw-btn.solid{border-color:transparent;background:var(--text);color:var(--bg)}
.fw-btn.solid:hover:not(:disabled){filter:brightness(.92)}.fw-btn.ghost:hover:not(:disabled){border-color:color-mix(in srgb,var(--text) 35%,var(--border))}
.fw-btn:disabled{opacity:.45;cursor:default}
.fw-pill{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:7px;font-style:normal;font-size:11px;font-weight:650;vertical-align:middle;background:color-mix(in srgb,var(--accent) 18%,transparent);color:color-mix(in srgb,var(--accent) 70%,#fff)}
.fw-pill.green{background:rgba(47,158,110,.18);color:#5fd3a0}.fw-pill.violet{background:color-mix(in srgb,var(--accent) 18%,transparent);color:color-mix(in srgb,var(--accent) 70%,#fff)}.fw-pill.muted{background:color-mix(in srgb,var(--muted) 18%,transparent);color:var(--muted)}
.fw-radios{display:grid;gap:8px}
.fw-radio,.fw-method{display:flex;gap:12px;width:100%;padding:16px 18px;border:1px solid var(--border);border-radius:14px;background:transparent;color:var(--text);text-align:left;font:inherit;cursor:pointer}
.fw-radio.on,.fw-method.on{border-color:var(--text);box-shadow:inset 0 0 0 1px var(--text)}
.fw-radio-text{display:grid;gap:4px}.fw-radio-text b{font-size:14px}.fw-radio-text small{color:var(--muted);font-size:12px}
.fw-dot{flex:none;width:20px;height:20px;border:1.5px solid color-mix(in srgb,var(--muted) 70%,transparent);border-radius:50%;margin-top:1px}
.on>.fw-dot,.on .fw-method-top .fw-dot{border:6px solid var(--accent)}
.fw-radio .fw-dot{order:2;margin-left:auto}
.fw-methods{display:grid;gap:10px}
.fw-method{flex-direction:column;gap:8px;padding:20px 22px}
.fw-method-top{display:flex;align-items:center;gap:10px}.fw-method-top b{font-size:17px}.fw-method-top .fw-dot{margin-left:auto}
.fw-tag{padding:3px 9px;border-radius:7px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:color-mix(in srgb,var(--accent) 70%,#fff);font:600 12px ui-monospace,monospace;font-style:normal}
.fw-method-desc{color:color-mix(in srgb,var(--text) 80%,var(--muted));font-size:14px;line-height:1.5}
.fw-method small{font-size:12px;line-height:1.5}
.fw-method.soon{opacity:.6;cursor:not-allowed}
.fw-extra{display:grid;gap:6px;padding:18px 20px;border:1px solid var(--border);border-radius:14px}
.fw-extra>b{font-size:15px}.fw-extra>span{color:var(--muted);font-size:13px}
.fw-extra-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
.fw-extra-cards>div{display:grid;gap:6px;padding:14px 16px;border-radius:12px;background:color-mix(in srgb,var(--bg) 70%,transparent)}
.fw-extra-cards b{font-size:14px}.fw-extra-cards small{color:var(--muted);font-size:12px;line-height:1.5}
.fw-spec summary{cursor:pointer;color:var(--muted);font-size:13px}
.fw-foot{display:flex;align-items:center;gap:12px;padding-top:6px;border-top:1px solid var(--border)}.fw-foot>.fw-muted{font-size:13px}
.fw-select-wrap{position:relative}
.fw-select{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:52px;padding:0 16px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:inherit;cursor:pointer}
.fw-model-name{display:flex;align-items:center;flex-wrap:wrap;gap:4px}.fw-model-name b{font-size:15px;text-transform:none}
.fw-menu{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 6px);max-height:340px;overflow:auto;padding:6px;border:1px solid var(--border);border-radius:14px;background:var(--surface);box-shadow:0 18px 40px rgba(0,0,0,.45)}
.fw-menu button{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:10px 12px;border:0;border-radius:10px;background:transparent;color:var(--text);font:inherit;text-align:left;cursor:pointer}
.fw-menu button:hover,.fw-menu button.on{background:color-mix(in srgb,var(--accent) 12%,transparent)}
.fw-menu button span:first-child{display:grid;gap:2px}.fw-menu small{color:var(--muted);font-size:11px}
.fw-badges{display:flex;flex-wrap:wrap;justify-content:flex-end}
.fw-dsinfo{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted)}.fw-dsinfo b{color:var(--text)}
.fw-or{text-align:center;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted)}
.fw-tabs{display:flex;gap:6px;justify-content:center}
.fw-tabs button{min-height:34px;padding:0 14px;border:1px solid var(--border);border-radius:99px;background:transparent;color:var(--muted);font:inherit;font-size:13px;cursor:pointer}
.fw-tabs button.on{border-color:var(--text);color:var(--text)}
.fw-drop{display:block;width:100%;padding:26px 16px;border:1.5px dashed color-mix(in srgb,var(--muted) 45%,transparent);border-radius:14px;background:transparent;color:var(--muted);font:inherit;font-size:14px;text-align:center;cursor:pointer}
.fw-drop b{color:color-mix(in srgb,var(--accent) 75%,#fff)}.fw-drop small{display:block;margin-top:6px;font-size:12px}
.fw-drop.drag,.fw-drop:hover{border-color:var(--accent)}.fw-drop.small{padding:14px}
.fw-up{font-size:16px}
.fw-files{display:flex;flex-wrap:wrap;gap:6px}.fw-files span{display:flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid var(--border);border-radius:8px;font-size:12px}.fw-files button{display:grid;border:0;background:none;color:var(--muted);cursor:pointer}.fw-files svg{width:14px;height:14px}
.fw-docs,.fw-hf{display:grid;gap:10px}
.fw-busy{margin:0;font-size:13px}
.fw-review{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border:1px solid var(--border);border-radius:12px;font-size:13px;color:var(--muted)}
.fw-review.ok{border-color:rgba(47,158,110,.5);color:#5fd3a0}.fw-review.bad{border-color:rgba(255,120,100,.4);color:#ff9b8a}
.fw-grid1{display:grid;gap:12px}.fw-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.fw-field{display:grid;gap:6px}.fw-field label,.fw-grid3 .parameter label{font-size:13px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--text)}
.fw-grid3 .parameter input,.fw-grid3 .parameter select{min-height:44px;border-radius:12px;background:var(--bg);border-color:var(--border);color:var(--text)}
.fw-fixed{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12px;color:var(--muted)}.fw-fixed b{color:var(--text);font-weight:600;margin-right:4px}
.fw-trainrow{display:flex;align-items:center;gap:12px;padding-top:8px;border-top:1px solid var(--border)}.fw-trainrow>.fw-muted{font-size:13px}
.fw .run-card{margin:0}
.fw-connect{display:grid;gap:12px;padding:14px 16px;border:1px solid var(--border);border-radius:14px}
.fw-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14px}
.fw-status{display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:50%;background:var(--muted)}.fw-status.on{background:#3fb98a;box-shadow:0 0 8px rgba(63,185,138,.6)}
.fw-keyform{display:grid;gap:8px}.fw-keyform label{font-size:13px;font-weight:600}.fw-keyform input{min-height:44px;padding:0 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:inherit}.fw-keyform .fw-btn{justify-self:start}
@media(max-width:700px){.fw-grid3,.fw-extra-cards{grid-template-columns:1fr}.fw-head{padding:16px}.fw-body{padding:0 16px 16px}.fw-sum{display:none}.fw-trainrow,.fw-foot{flex-wrap:wrap}}
.fw-views{display:flex;width:max-content;max-width:100%;justify-self:start;gap:4px;margin:14px 0 16px;padding:4px;border:1px solid var(--border);border-radius:14px;background:color-mix(in srgb,var(--surface) 80%,transparent)}
.fw-views button{display:flex;align-items:center;gap:8px;min-height:38px;padding:0 18px;border:0;border-radius:10px;background:transparent;color:var(--muted);font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.fw-views button.on{background:var(--surface);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}
.fw-live{width:7px;height:7px;border-radius:50%;background:#3fb98a;box-shadow:0 0 8px rgba(63,185,138,.7)}
.fw-radio.soon{opacity:.55;cursor:not-allowed}
.fw-drop{display:flex;align-items:center;justify-content:center;gap:8px;padding:30px 16px}.fw-upicon{width:22px;height:22px;color:var(--muted)}
.fw-hf .hf-search{display:flex;gap:8px}
.pipe.pipe3{grid-template-columns:repeat(3,1fr)!important;max-width:760px;margin:6px auto 4px}
@media(min-width:901px){.pipe.pipe3:before{left:16.6%!important;right:16.6%!important}}
@media(max-width:900px){.pipe.pipe3{grid-template-columns:repeat(3,1fr)!important}.pipe.pipe3 .stage:nth-child(4n+1):before{display:none!important}}
.pipe .label .fw-live{display:inline-block;margin-left:7px;vertical-align:middle}
.fw-rl{display:grid;gap:8px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--accent) 30%,var(--border));border-radius:14px}
.fw-emptyrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.fw-runtop{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;font-size:13px}
.fw-state{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:650;background:color-mix(in srgb,var(--muted) 16%,transparent);color:var(--text)}
.fw-state.running,.fw-state.pending,.fw-state.preparing,.fw-state.uploading{background:rgba(47,158,110,.16);color:#5fd3a0}.fw-state.completed{background:color-mix(in srgb,var(--accent) 18%,transparent);color:color-mix(in srgb,var(--accent) 70%,#fff)}.fw-state.failed{background:rgba(255,110,90,.14);color:#ff9b8a}
.fw-link{margin-left:auto;color:color-mix(in srgb,var(--accent) 75%,#fff);font-size:13px;text-decoration:none}.fw-link:hover{text-decoration:underline}
.fw-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
.fw-stats span{display:grid;gap:3px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;color:var(--muted);font-size:12px}
.fw-stats b{color:var(--text);font-size:18px;font-weight:650}.fw-stats b.up{color:#5fd3a0}.fw-stats b.down{color:#ff9b8a}
.fw-rename{display:flex;gap:8px}.fw-rename .fw-input{flex:1}
.fw-nav-split{justify-content:space-between;margin-left:0;width:100%}
.fw-btn.danger{border-color:rgba(255,110,90,.45);color:#ff9b8a}.fw-btn.danger:hover:not(:disabled){background:rgba(255,110,90,.1)}
.fw-check{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text);cursor:pointer}.fw-check input{width:18px;height:18px;accent-color:var(--accent)}
.fw-table{width:100%;border-collapse:collapse;font-size:13px}.fw-table th{padding:8px 10px;text-align:left;color:var(--muted);font-weight:600;border-bottom:1px solid var(--border)}.fw-table td{padding:10px;border-bottom:1px solid color-mix(in srgb,var(--border) 60%,transparent)}
.fw-table i{margin-left:8px;font-style:normal;font-size:12px;color:var(--muted)}.fw-table i.up{color:#5fd3a0}.fw-table i.down{color:#ff9b8a}
.fw-subhead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:6px}.fw-subhead b{font-size:15px}.fw-subhead span{font-size:12px}
.fw .charts{margin-top:2px}
.fw-drop{flex-direction:row;color:var(--muted);font-size:15px}.fw-drop span b{color:color-mix(in srgb,var(--accent) 75%,#fff);font-weight:600}
.fw .fw-hf .hf-search{display:flex;flex-direction:row;gap:8px;align-items:stretch}
.fw .fw-hf .hf-search input{flex:1;min-height:46px;padding:0 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:inherit;font-family:var(--font);font-size:14px;line-height:normal}
.fw .fw-hf .hf-search input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.fw .fw-hf .hf-results{margin-top:0;gap:6px}
.fw .fw-hf .hf-result{padding:12px 14px;border-radius:12px;background:var(--bg);font-family:var(--font);font-size:14px}
.fw .fw-hf .hf-result b{font-size:14px;font-weight:600}.fw .fw-hf .hf-result span{font-size:12px;margin-top:2px}
.fw .fw-hf .hf-result>span{font-size:13px;color:color-mix(in srgb,var(--accent) 75%,#fff)}
.fw .fw-label{font-family:var(--font);font-size:13px;font-weight:600}
/* 3-step pipeline: connectors only between circles, never before the first or after the last */
.pipe.pipe3:before,.pipe.pipe3:after{display:none!important;content:none!important}
.pipe.pipe3 .stage{position:relative;padding-top:0!important}
.pipe.pipe3 .dot{width:56px!important;height:56px!important}
.pipe.pipe3 .stage:before{display:none!important}
.pipe.pipe3 .stage+.stage:before{display:block!important;content:'';position:absolute;z-index:0;top:27px!important;bottom:auto!important;left:calc(-50% + 36px)!important;right:calc(50% + 36px)!important;width:auto!important;height:2px!important;border-radius:2px;background:rgba(125,101,255,.45)!important;box-shadow:none!important}
.fw-btn.sm{min-height:34px;padding:0 12px;font-size:13px;border-radius:10px;color:var(--muted)}.fw-btn.sm:hover{color:var(--text)}
.fw-connect .fw-row{gap:10px}.fw-connect .fw-row>span{margin-right:auto}
.fw-connect{border-color:color-mix(in srgb,var(--accent) 42%,var(--border))!important;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 12%,transparent),color-mix(in srgb,var(--accent) 4%,transparent))!important}
.fw-connect .fw-btn.ghost{border-color:color-mix(in srgb,var(--accent) 45%,var(--border));color:color-mix(in srgb,var(--accent) 70%,#fff)}
.fw-connect .fw-btn.ghost:hover{background:color-mix(in srgb,var(--accent) 12%,transparent)}
.fw-keyform{padding-top:12px;border-top:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
.fw-keyform input{border-color:color-mix(in srgb,var(--accent) 30%,var(--border))!important}
.fw-btn.accent{display:inline-flex;align-items:center;justify-content:center;gap:8px;justify-self:start;min-height:44px;padding:0 22px;border:0;border-radius:12px;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#c084fc));color:#fff;font-weight:650;box-shadow:0 6px 20px color-mix(in srgb,var(--accent) 35%,transparent);transition:transform .12s,box-shadow .12s,filter .12s}
.fw-btn.accent svg{width:15px;height:15px}
.fw-btn.accent:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 26px color-mix(in srgb,var(--accent) 45%,transparent)}
.fw-btn.accent:disabled{opacity:.5;box-shadow:none}
/* primary buttons: purple instead of white */
.fw-btn.solid{border:0!important;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#c084fc))!important;color:#fff!important;box-shadow:0 6px 18px color-mix(in srgb,var(--accent) 30%,transparent);transition:transform .12s,box-shadow .12s,filter .12s}
.fw-btn.solid:hover:not(:disabled){filter:none!important;transform:translateY(-1px);box-shadow:0 10px 24px color-mix(in srgb,var(--accent) 42%,transparent)}
.fw-btn.solid:active:not(:disabled){transform:translateY(0)}
.fw-btn.solid:disabled{opacity:.4;box-shadow:none;transform:none}
.fw-radio.on,.fw-method.on{border-color:var(--accent)!important;box-shadow:inset 0 0 0 1px var(--accent),0 0 0 4px color-mix(in srgb,var(--accent) 12%,transparent)!important;background:color-mix(in srgb,var(--accent) 7%,transparent)!important}
.fw-tabs button.on{border-color:var(--accent);color:color-mix(in srgb,var(--accent) 70%,#fff)}
/* calmer primary buttons */
.fw-btn.solid,.fw-btn.accent{background:color-mix(in srgb,var(--accent) 62%,#1a1530)!important;color:#f1edff!important;border:1px solid color-mix(in srgb,var(--accent) 70%,transparent)!important;box-shadow:0 2px 10px color-mix(in srgb,var(--accent) 16%,transparent)!important}
.fw-btn.solid:hover:not(:disabled),.fw-btn.accent:hover:not(:disabled){background:color-mix(in srgb,var(--accent) 74%,#1a1530)!important;box-shadow:0 4px 14px color-mix(in srgb,var(--accent) 24%,transparent)!important}
/* card header: title fills the row so the summary and arrow always sit at the right edge */
.fw-head>b{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fw-head .fw-sum{margin-left:0!important;flex:0 1 auto;max-width:45%}
.fw-head .fw-chev{margin-left:10px!important}
@media(max-width:700px){.fw-head .fw-sum{display:block!important;max-width:38%;font-size:12px}}
.fw-select .fw-chev{margin-left:10px!important}
.fw-checks{display:grid;gap:6px}
.fw-checkrow{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;cursor:pointer}
.fw-checkrow:has(input:checked){border-color:color-mix(in srgb,var(--accent) 60%,var(--border));background:color-mix(in srgb,var(--accent) 7%,transparent)}
.fw-checkrow input{width:17px;height:17px;margin-top:2px;accent-color:var(--accent);flex:none}
.fw-checkrow span{display:grid;gap:2px}.fw-checkrow b{font-size:14px;font-weight:600}.fw-checkrow small{color:var(--muted);font-size:12px}.fw-inline{display:flex;gap:8px}.fw-inline .fw-input{flex:1}
.fw-placeholder{color:var(--muted);font-size:14px}
/* headers can never push the arrow out, at any width */
.fw-card{min-width:0}
.fw-head{min-width:0;max-width:100%;overflow:hidden}
.fw-head .fw-num,.fw-head .fw-chev{flex:0 0 auto}
.fw-head .fw-sum{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:480px){.fw-head{gap:10px;padding:14px}.fw-head>b{font-size:15px}.fw-head .fw-sum{display:none!important}}
/* long option text must never widen a card: grid tracks and selects stay within the card */
.fw-body{grid-template-columns:minmax(0,1fr)}
.fw-body>*,.fw-grid1>*,.fw-grid3>*,.fw-field{min-width:0}
.fw select,.fw .fw-input{display:block;width:100%;max-width:100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fw-select{gap:12px;min-width:0;max-width:100%;padding:0 14px 0 16px!important;text-align:left}
.fw-select-text{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}
.fw-select:disabled{opacity:.6;cursor:default}
.fw-select .fw-chev{flex:0 0 18px;margin-left:0!important}
.fw-menu button span b{font-weight:500;font-size:14px}
.body{grid-template-columns:minmax(0,1fr)!important;max-width:980px}
`;
export default MOBIUS;
