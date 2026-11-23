/* HamroKarobar Personal Finance v1 — isolated workspace logic.
   Requires supabase/personal-finance.sql to be applied once in Supabase SQL Editor. */
(function(){
'use strict';
var pf = {accounts:[],transactions:[],goals:[],contributions:[],loans:[],payments:[],categories:[],editing:{income:null,expense:null},ready:false,loading:false,busyEntry:false,busyTransfer:false};
var pfDefaultAccounts=[
 {name:'Cash',account_type:'cash',opening_balance:0,is_savings:false},
 {name:'Bank',account_type:'bank',opening_balance:0,is_savings:false},
 {name:'eSewa',account_type:'esewa',opening_balance:0,is_savings:false},
 {name:'Khalti',account_type:'khalti',opening_balance:0,is_savings:false}
];
function pfUser(){return window.currentUser || currentUser || null;}
function pfUid(){var u=pfUser();return u&&u.id?u.id:null;}
function pfT(ne,en){return (window.LANG||LANG)==='en'?en:ne;}

function pfApplyStaticLanguage(){
 var sections=['perDash','perInc','perExp','perAccounts','perTransfers','perSavings','perLoans','perReports'];
 var pairs=[
 ['Personal Finance Dashboard','व्यक्तिगत वित्त ड्यासबोर्ड'],['Available Balance','उपलब्ध मौज्दात'],['Total Income','कुल आम्दानी'],['Total Expenses','कुल खर्च'],['Total Savings','कुल बचत'],['Receivable','प्राप्त गर्नुपर्ने'],['Payable','तिर्नुपर्ने'],['Monthly Cash Flow','मासिक नगद प्रवाह'],['Account Balances','खाता मौज्दात'],['Recent Transactions','हालैका कारोबार'],['Date','मिति'],['Details','विवरण'],['Type','प्रकार'],['Account','खाता'],['Amount','रकम'],['PERSONAL LEDGER','व्यक्तिगत हिसाब'],['Income Management','आम्दानी व्यवस्थापन'],['Salary, business, freelance, rent, interest and other income','तलब, व्यवसाय, फ्रीलान्स, भाडा, ब्याज र अन्य आम्दानी'],['Add Income','आम्दानी थप्नुहोस्'],['Source','स्रोत'],['Category','शीर्षक'],['Amount (NPR)','रकम (NPR)'],['Note','कैफियत'],['Optional note','वैकल्पिक कैफियत'],['Save Income','आम्दानी सुरक्षित गर्नुहोस्'],['Cancel','रद्द गर्नुहोस्'],['Income History','आम्दानी विवरण'],['Search income…','आम्दानी खोज्नुहोस्…'],['Expense Management','खर्च व्यवस्थापन'],['Track daily spending and custom categories','दैनिक खर्च र आफ्ना शीर्षकहरू व्यवस्थापन गर्नुहोस्'],['Add Expense','खर्च थप्नुहोस्'],['Description','विवरण'],['What did you spend on?','केमा खर्च गर्नुभयो?'],['Save Expense','खर्च सुरक्षित गर्नुहोस्'],['+ Custom Category','+ नयाँ शीर्षक'],['Expense History','खर्च विवरण'],['Search expenses…','खर्च खोज्नुहोस्…'],['PERSONAL MONEY','व्यक्तिगत रकम'],['Multiple Accounts','बहु खाताहरू'],['Cash, bank, eSewa, Khalti and custom wallets','नगद, बैंक, eSewa, Khalti र अन्य वालेट'],['Add Account','खाता थप्नुहोस्'],['Account Name','खाताको नाम'],['Opening Balance (NPR)','सुरुको मौज्दात (NPR)'],['Savings account','बचत खाता'],['Selected Account Transactions','छानिएको खाताका कारोबार'],['All accounts','सबै खाताहरू'],['INTERNAL MOVEMENT','आन्तरिक रकम स्थानान्तरण'],['Money Transfer','रकम स्थानान्तरण'],['Move money between your own accounts — never counted as income or expense','आफ्नै खाताहरूबीच रकम सार्नुहोस् — आम्दानी वा खर्चमा गणना हुँदैन'],['New Transfer','नयाँ स्थानान्तरण'],['From Account','कुन खाताबाट'],['To Account','कुन खातामा'],['Transfer Money','रकम स्थानान्तरण गर्नुहोस्'],['Transfer History','स्थानान्तरण विवरण'],['FUTURE PLANS','भविष्यको योजना'],['Savings Goals','बचत लक्ष्य'],['Create Savings Goal','बचत लक्ष्य बनाउनुहोस्'],['Goal Name','लक्ष्यको नाम'],['Goal Type','लक्ष्यको प्रकार'],['Target Amount (NPR)','लक्ष्य रकम (NPR)'],['Target Date','लक्ष्य मिति'],['Create Goal','लक्ष्य बनाउनुहोस्'],['Add Savings to Goal','लक्ष्यमा बचत थप्नुहोस्'],['Goal','लक्ष्य'],['Add Savings','बचत थप्नुहोस्'],['BORROWING & LENDING','ऋण लिने र दिने'],['Loan Management','ऋण व्यवस्थापन'],['Track principal, interest, due dates, repayments and outstanding balances','साँवा, ब्याज, भुक्तानी मिति, किस्ता र बाँकी रकमको हिसाब राख्नुहोस्'],['Add Loan','ऋण थप्नुहोस्'],['Money Borrowed','लिएको ऋण'],['Money Lent','दिएको ऋण'],['Person / Institution','व्यक्ति / संस्था'],['Principal (NPR)','साँवा (NPR)'],['Interest Rate (% p.a.)','ब्याजदर (% वार्षिक)'],['Due Date','भुक्तानी मिति'],['Save Loan','ऋण सुरक्षित गर्नुहोस्'],['Record Repayment','किस्ता दर्ता गर्नुहोस्'],['Loan','ऋण'],['Principal Paid','तिरेको साँवा'],['Interest Paid / Received','तिरेको / पाएको ब्याज'],['Save Repayment','किस्ता सुरक्षित गर्नुहोस्'],['Repayment History','किस्ता विवरण'],['FINANCIAL INSIGHTS','वित्तीय विश्लेषण'],['Financial Reports','वित्तीय प्रतिवेदन'],['Daily, weekly, monthly and yearly transaction reports','दैनिक, साप्ताहिक, मासिक र वार्षिक कारोबार प्रतिवेदन'],['Export Excel (CSV)','Excel निर्यात (CSV)'],['Export PDF / Print','PDF निर्यात / प्रिन्ट'],['From','देखि'],['To','सम्म'],['Preset','अवधि'],['All time','सबै समय'],['Today','आज'],['This week','यो हप्ता'],['This month','यो महिना'],['This year','यो वर्ष'],['Net Cash Flow','खुद नगद प्रवाह'],['Category-wise Breakdown','शीर्षकअनुसार विवरण'],['Account-wise Breakdown','खाताअनुसार विवरण'],['Actions','कार्य'],['No transactions yet','अहिलेसम्म कारोबार छैन'],['No accounts','कुनै खाता छैन'],['No transfers yet','अहिलेसम्म स्थानान्तरण छैन'],['No repayments','किस्ता विवरण छैन'],['No loans recorded','ऋण दर्ता गरिएको छैन'],['No report data','प्रतिवेदन विवरण छैन'],['No expense categories in this period','यस अवधिमा खर्चको शीर्षक छैन'],['No account activity','खातामा कारोबार छैन'],['Create your first savings goal','पहिलो बचत लक्ष्य बनाउनुहोस्'],['Borrowed','लिएको ऋण'],['Lent','दिएको ऋण'],['Principal','साँवा'],['Interest','ब्याज'],['Remaining','बाँकी'],['Saved','बचत'],['Delete','हटाउनुहोस्'],['Record payment','भुक्तानी दर्ता'],['Account:','खाता:'],['Other Digital Wallet','अन्य डिजिटल वालेट'],['Emergency Fund','आपतकालीन कोष'],['Monthly Savings','मासिक बचत'],['Fixed Deposit','मुद्दती बचत'],['General Goal','सामान्य लक्ष्य'],['Food & Grocery','खाना तथा किराना'],['House Rent','घर भाडा'],['Electricity & Water','बिजुली तथा पानी'],['Transportation','यातायात'],['Medical','स्वास्थ्य उपचार'],['Education','शिक्षा'],['Shopping','किनमेल'],['Entertainment','मनोरञ्जन'],['Travel','यात्रा'],['Family Expenses','पारिवारिक खर्च'],['Other Expenses','अन्य खर्च'],['Business Income','व्यवसाय आम्दानी'],['Freelancing','फ्रीलान्स आम्दानी'],['Rental Income','भाडा आम्दानी'],['Other Income','अन्य आम्दानी']
 ];
 var en=(window.LANG||LANG)==='en',map={};
 pairs.forEach(function(p){map[en?p[1]:p[0]]=en?p[0]:p[1];});
 sections.forEach(function(id){
  var el=document.getElementById(id);if(!el)return;
  var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false),nodes=[];
  while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(function(n){var raw=n.nodeValue,trim=raw.trim();if(map[trim])n.nodeValue=raw.replace(trim,map[trim]);});
  el.querySelectorAll('[placeholder]').forEach(function(x){var v=x.getAttribute('placeholder');if(map[v])x.setAttribute('placeholder',map[v]);});
 });
 var nav=document.getElementById('navPersonal');
 if(nav){var w2=document.createTreeWalker(nav,NodeFilter.SHOW_TEXT,null,false),n2=[];while(w2.nextNode())n2.push(w2.currentNode);n2.forEach(function(n){var v=n.nodeValue.trim();if(map[v])n.nodeValue=n.nodeValue.replace(v,map[v]);});}
}
window.applyPersonalFinanceLanguage=function(){
 if(pf.ready){pfPopulate();pfDashboard();window.renderPersonalTables();pfRenderAccounts();pfRenderTransfers();pfRenderSavings();pfRenderLoans();window.renderPersonalReports();}
 pfApplyStaticLanguage();
};
// Re-run the Personal Finance translations whenever the app's language setting changes.
if(typeof window.applyAppLanguage==='function'&&!window._pfLanguageHooked){
 var pfOriginalApplyAppLanguage=window.applyAppLanguage;
 window.applyAppLanguage=function(){pfOriginalApplyAppLanguage.apply(this,arguments);if(window.applyPersonalFinanceLanguage)window.applyPersonalFinanceLanguage();};
 window._pfLanguageHooked=true;
}

function pfEsc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pfMoney(v){return 'रू '+Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2});}
function pfDate(){return new Date().toISOString().slice(0,10);}
function pfDateLabel(v){
 if(!v)return '-';
 var d=new Date(String(v).slice(0,10)+'T00:00:00');
 if(isNaN(d.getTime()))return v;
 // Always show one English/Gregorian date; never append a second Nepali calendar date.
 return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(d);
}
function pfStatus(msg,isError){var el=document.getElementById('pfStatus');if(el){el.textContent=msg||'';el.classList.toggle('error',!!isError);}}
async function pfFetch(table){
 var q=await supa.from(table).select().eq('user_id',pfUid());
 if(q.error)throw new Error(q.error.message||('Cannot read '+table));
 return q.data||[];
}
async function pfInsert(table,payload){
 var q=await supa.from(table).insert(payload);
 if(q.error)throw new Error(q.error.message||('Cannot save '+table));
 return q.data||[];
}
async function pfRefresh(){
 if(!pfUid())throw new Error(pfT('पहिले लगइन गर्नुहोस्','Please sign in first.'));
 if(pf.loading)return;
 pf.loading=true;
 try{
  var acc=await pfFetch('personal_accounts');
  if(!acc.length){
   await pfInsert('personal_accounts',pfDefaultAccounts.map(function(a){return Object.assign({user_id:pfUid()},a);}));
   acc=await pfFetch('personal_accounts');
  }
  // Import the user's previous browser-only Personal Finance records once.
  var migrationKey='hk_pf_legacy_import_v1_'+pfUid();
  if(!localStorage.getItem(migrationKey)){
   var legacyExp=[],legacyInc=[],legacyParty=[];
   try{legacyExp=JSON.parse(localStorage.getItem('kh_personal_expense_'+pfUid())||'[]')||[];}catch(e){}
   try{legacyInc=JSON.parse(localStorage.getItem('kh_personal_income_'+pfUid())||'[]')||[];}catch(e){}
   try{legacyParty=JSON.parse(localStorage.getItem('kh_personal_party_'+pfUid())||'[]')||[];}catch(e){}
   var cash=acc.find(function(a){return a.account_type==='cash';})||acc[0];
   var legacyRows=[];
   legacyExp.forEach(function(x){legacyRows.push({user_id:pfUid(),account_id:cash.id,kind:'expense',amount:Number(x.amount||0),occurred_on:x.date||pfDate(),category:x.category||'Other Expenses',description:x.title||'Legacy expense',note:x.note||null});});
   legacyInc.forEach(function(x){legacyRows.push({user_id:pfUid(),account_id:cash.id,kind:'income',amount:Number(x.amount||0),occurred_on:x.date||pfDate(),category:'Other Income',description:x.title||'Legacy income',note:x.note||null});});
   legacyRows=legacyRows.filter(function(x){return x.amount>0;});
   if(legacyRows.length)await pfInsert('personal_transactions',legacyRows);
   for(var i=0;i<legacyParty.length;i++){
    var p=legacyParty[i];if(!(Number(p.amount)>0))continue;
    await pfInsert('personal_loans',{user_id:pfUid(),loan_type:p.type==='receivable'?'lent':'borrowed',party_name:p.name||'Legacy party',principal:Number(p.amount),interest_rate:0,account_id:cash.id,note:[p.phone,p.note].filter(Boolean).join(' · ')||null});
   }
   localStorage.setItem(migrationKey,'1');
  }
  var vals=await Promise.all([
   pfFetch('personal_accounts'),pfFetch('personal_transactions'),pfFetch('personal_savings_goals'),
   pfFetch('personal_savings_contributions'),pfFetch('personal_loans'),pfFetch('personal_loan_payments'),pfFetch('personal_categories')
  ]);
  pf.accounts=vals[0];pf.transactions=vals[1];pf.goals=vals[2];pf.contributions=vals[3];pf.loans=vals[4];pf.payments=vals[5];pf.categories=vals[6];pf.ready=true;
 }finally{pf.loading=false;}
}
function pfTxIn(t){return ['income','transfer_in','loan_principal_in','loan_interest_income'].indexOf(t.kind)>=0;}
function pfTxOut(t){return ['expense','transfer_out','loan_principal_out','loan_interest_expense'].indexOf(t.kind)>=0;}
function pfIncome(t){return t.kind==='income'||t.kind==='loan_interest_income';}
function pfExpense(t){return t.kind==='expense'||t.kind==='loan_interest_expense';}
function pfAccBalance(a){
 var n=Number(a.opening_balance||0);
 pf.transactions.forEach(function(t){if(t.account_id===a.id){if(pfTxIn(t))n+=Number(t.amount||0);else if(pfTxOut(t))n-=Number(t.amount||0);}});
 return n;
}
function pfLoanPaid(l){return pf.payments.filter(function(p){return p.loan_id===l.id;}).reduce(function(n,p){return n+Number(p.principal_amount||0);},0);}
function pfLoanRemaining(l){return Math.max(0,Number(l.principal||0)-pfLoanPaid(l));}
function pfAccountName(id){var a=pf.accounts.find(function(x){return x.id===id;});return a?a.name:'-';}
function pfTypeLabel(k){var m={income:['आम्दानी','Income'],expense:['खर्च','Expense'],transfer_in:['आएको स्थानान्तरण','Transfer in'],transfer_out:['गएको स्थानान्तरण','Transfer out'],loan_principal_in:['ऋणको साँवा प्राप्त','Loan principal in'],loan_principal_out:['ऋणको साँवा भुक्तानी','Loan principal out'],loan_interest_income:['ऋण ब्याज आम्दानी','Loan interest'],loan_interest_expense:['ऋण ब्याज भुक्तानी','Loan interest paid']};return m[k]?pfT(m[k][0],m[k][1]):k;}
function pfSetOptions(id,items,placeholder){
 var el=document.getElementById(id);if(!el)return;
 var prev=el.value;el.innerHTML='';
 if(placeholder){var o=document.createElement('option');o.value='';o.textContent=placeholder;el.appendChild(o);}
 items.forEach(function(x){var o=document.createElement('option');o.value=x.id;o.textContent=x.name||x.party_name||x.title;el.appendChild(o);});
 if(items.some(function(x){return x.id===prev;}))el.value=prev;
}
function pfPopulate(){
 ['piAccount','peAccount','pfTransferFrom','pfTransferTo','pfLoanAccount','pfPayAccount','pfAccountHistorySelect'].forEach(function(id){pfSetOptions(id,pf.accounts,id==='pfAccountHistorySelect'?'All accounts':null);});
 pfSetOptions('pfPayLoan',pf.loans.map(function(l){return {id:l.id,name:(l.loan_type==='borrowed'?'Borrowed · ':'Lent · ')+l.party_name+' · '+pfMoney(pfLoanRemaining(l))};}),null);
 pfSetOptions('pfContributionGoal',pf.goals.map(function(g){return {id:g.id,name:g.title};}),null);
 ['peCat','piCat'].forEach(function(id){
  var el=document.getElementById(id);if(!el)return;
  var kind=id==='peCat'?'expense':'income';var built=kind==='expense'?['Food & Grocery','House Rent','Electricity & Water','Transportation','Medical','Education','Shopping','Entertainment','Travel','Family Expenses','Other Expenses']:['Salary','Business Income','Freelancing','Rental Income','Interest','Other Income'];
  var custom=pf.categories.filter(function(c){return c.kind===kind;}).map(function(c){return c.name;});
  var val=el.value;el.innerHTML='';built.concat(custom).filter(function(v,i,a){return a.indexOf(v)===i;}).forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});if(val)el.value=val;
 });
}
function pfRows(rows,empty){return rows.length?rows:[];}
window.renderPersonalAll=async function(){
 try{await pfRefresh();pfPopulate();pfDashboard();window.renderPersonalTables();pfRenderAccounts();pfRenderTransfers();pfRenderSavings();pfRenderLoans();window.renderPersonalReports();pfStatus(pfT('व्यक्तिगत वित्तको डाटा अपडेट भयो।','Personal Finance data is up to date.'));}
 catch(e){pfStatus(pfT('डाटाबेस तयार छैन वा लोड हुन सकेन: ','Database is not ready or could not be loaded: ')+e.message+' · '+pfT('Supabase SQL Editor मा supabase/personal-finance.sql चलाउनुहोस्।','Run supabase/personal-finance.sql in Supabase SQL Editor.'),true);}
};
function pfDashboard(){
 var inc=0,exp=0,bal=0,sav=pf.goals.reduce(function(n,g){return n+Number(g.saved_amount||0);},0),rec=0,pay=0,month=pfDate().slice(0,7),mi=0,me=0;
 pf.accounts.forEach(function(a){bal+=pfAccBalance(a);});
 pf.transactions.forEach(function(t){if(pfIncome(t))inc+=Number(t.amount||0);if(pfExpense(t))exp+=Number(t.amount||0);if(String(t.occurred_on||'').slice(0,7)===month){if(pfIncome(t))mi+=Number(t.amount||0);if(pfExpense(t))me+=Number(t.amount||0);}});
 pf.loans.forEach(function(l){if(l.loan_type==='lent')rec+=pfLoanRemaining(l);else pay+=pfLoanRemaining(l);});
 [['pfBalance',bal],['pfIncome',inc],['pfExpense',exp],['pfSavings',sav],['pfReceivable',rec],['pfPayable',pay],['pfCashFlow',mi-me]].forEach(function(x){var e=document.getElementById(x[0]);if(e)e.textContent=pfMoney(x[1]);});
 var recent=pf.transactions.slice().sort(function(a,b){return String(b.occurred_on).localeCompare(String(a.occurred_on))||String(b.created_at).localeCompare(String(a.created_at));}).slice(0,10);
 var body=document.getElementById('pfRecentRows');if(body)body.innerHTML=recent.length?recent.map(function(t){return '<tr><td>'+pfDateLabel(t.occurred_on)+'</td><td>'+pfEsc(t.description)+'</td><td><span class="pf-badge '+(pfExpense(t)?'exp':(t.kind.indexOf('transfer')===0?'transfer':''))+'">'+pfEsc(pfTypeLabel(t.kind))+'</span></td><td>'+pfEsc(pfAccountName(t.account_id))+'</td><td class="pf-amount">'+pfMoney(t.amount)+'</td></tr>';}).join(''):'<tr><td colspan="5" class="pf-empty">No transactions yet</td></tr>';
 var ao=document.getElementById('pfAccountOverview');if(ao)ao.innerHTML=pf.accounts.map(function(a){return '<div class="pf-break-row"><span>'+pfEsc(a.name)+'</span><strong>'+pfMoney(pfAccBalance(a))+'</strong></div>';}).join('')||'<p class="pf-empty">No accounts</p>';
 var chart=document.getElementById('pfCashFlowChart');if(chart){var days=[];for(var i=5;i>=0;i--){var d=new Date();d.setMonth(d.getMonth()-i);var key=d.toISOString().slice(0,7);var x={key:key,label:key.slice(5),income:0,expense:0};pf.transactions.forEach(function(t){if(String(t.occurred_on).slice(0,7)===key){if(pfIncome(t))x.income+=Number(t.amount);if(pfExpense(t))x.expense+=Number(t.amount);}});days.push(x);}var max=Math.max(1,...days.map(function(x){return Math.max(x.income,x.expense);}));chart.innerHTML='<div class="pf-bars">'+days.map(function(x){return '<div class="pf-bar-col"><div class="pf-bar-pair"><span class="pf-bar" title="Income '+pfMoney(x.income)+'" style="height:'+Math.max(2,x.income/max*100)+'%"></span><span class="pf-bar exp" title="Expense '+pfMoney(x.expense)+'" style="height:'+Math.max(2,x.expense/max*100)+'%"></span></div><small>'+x.label+'</small></div>';}).join('')+'</div><p class="pf-hint">■ Income &nbsp; <span style="color:#fb7185">■</span> Expenses · NPR';}
}
window.savePersonalEntry=async function(kind){
 if(pf.busyEntry)return;
 var exp=kind==='expense',id=pf.editing[kind],date=document.getElementById(exp?'peDate':'piDate').value||pfDate(),desc=(document.getElementById(exp?'peItem':'piSource').value||'').trim(),amount=Number(document.getElementById(exp?'peAmt':'piAmt').value),category=document.getElementById(exp?'peCat':'piCat').value,account=document.getElementById(exp?'peAccount':'piAccount').value,note=(document.getElementById(exp?'peNote':'piNote').value||'').trim();
 if(!desc||!(amount>0)||!account)return alert(pfT('विवरण, खाता र सही रकम भर्नुहोस्।','Enter a description, account and valid amount.'));
 pf.busyEntry=true;
 var payload={user_id:pfUid(),account_id:account,kind:kind,amount:amount,occurred_on:date,category:category,description:desc,note:note||null};
 try{var q=id?await supa.from('personal_transactions').update(payload).eq('id',id).eq('user_id',pfUid()):await supa.from('personal_transactions').insert(payload);if(q.error)throw new Error(q.error.message);window.cancelPersonalEdit(kind);await window.renderPersonalAll();alert(pfT('सेभ भयो।','Saved successfully.'));}
 catch(e){alert(pfT('सेभ गर्न सकिएन: ','Could not save: ')+e.message);}
 finally{pf.busyEntry=false;}
};
window.cancelPersonalEdit=function(kind){
 pf.editing[kind]=null;var exp=kind==='expense';['Date','Item','Amt','Note'].forEach(function(s){var id=(exp?'pe':'pi')+s;var e=document.getElementById(id);if(e)e.value='';});
 var title=document.getElementById(exp?'pfExpenseFormTitle':'pfIncomeFormTitle');if(title)title.textContent=exp?'Add Expense':'Add Income';
};
window.editPersonalEntry=function(id){
 var t=pf.transactions.find(function(x){return x.id===id;});if(!t)return;
 var exp=t.kind==='expense',kind=exp?'expense':'income';if(!exp&&t.kind!=='income')return;
 pf.editing[kind]=id;var pre=exp?'pe':'pi';
 document.getElementById(pre+'Date').value=t.occurred_on||pfDate();document.getElementById(pre+(exp?'Item':'Source')).value=t.description||'';document.getElementById(pre+'Amt').value=t.amount||'';document.getElementById(pre+'Note').value=t.note||'';document.getElementById(pre+'Cat').value=t.category||'';document.getElementById(pre+'Account').value=t.account_id;
 var h=document.getElementById(exp?'pfExpenseFormTitle':'pfIncomeFormTitle');if(h)h.textContent='Edit '+kind;document.getElementById(exp?'perExp':'perInc').scrollIntoView({behavior:'smooth'});
};
window.deletePersonalEntry=async function(id){if(!confirm(pfT('यो कारोबार हटाउने?','Delete this transaction?')))return;try{var q=await supa.from('personal_transactions').delete().eq('id',id).eq('user_id',pfUid());if(q.error)throw new Error(q.error.message);await window.renderPersonalAll();}catch(e){alert(e.message);}};
window.renderPersonalTables=function(){
 var exp=pf.transactions.filter(function(t){return t.kind==='expense';}),inc=pf.transactions.filter(function(t){return t.kind==='income';});
 var qe=(document.getElementById('searchPe')||{}).value||'',qi=(document.getElementById('searchPi')||{}).value||'';
 function rows(arr,q){q=q.toLowerCase();return arr.filter(function(t){return !q||[t.description,t.category,t.note,pfAccountName(t.account_id)].join(' ').toLowerCase().indexOf(q)>=0;}).sort(function(a,b){return String(b.occurred_on).localeCompare(String(a.occurred_on));});}
 var eb=document.getElementById('pfExpenseRows'),ib=document.getElementById('pfIncomeRows');
 if(eb)eb.innerHTML=rows(exp,qe).map(function(t){return '<tr><td>'+pfDateLabel(t.occurred_on)+'</td><td>'+pfEsc(t.description)+'</td><td>'+pfEsc(t.category)+'</td><td>'+pfEsc(pfAccountName(t.account_id))+'</td><td class="pf-amount">'+pfMoney(t.amount)+'</td><td><button onclick="editPersonalEntry(\''+t.id+'\')">Edit</button><button class="pf-danger" onclick="deletePersonalEntry(\''+t.id+'\')">Delete</button></td></tr>';}).join('')||'<tr><td colspan="6" class="pf-empty">No expenses found</td></tr>';
 if(ib)ib.innerHTML=rows(inc,qi).map(function(t){return '<tr><td>'+pfDateLabel(t.occurred_on)+'</td><td>'+pfEsc(t.description)+'</td><td>'+pfEsc(t.category)+'</td><td>'+pfEsc(pfAccountName(t.account_id))+'</td><td class="pf-amount">'+pfMoney(t.amount)+'</td><td><button onclick="editPersonalEntry(\''+t.id+'\')">Edit</button><button class="pf-danger" onclick="deletePersonalEntry(\''+t.id+'\')">Delete</button></td></tr>';}).join('')||'<tr><td colspan="6" class="pf-empty">No income found</td></tr>';
};
window.addPersonalCategory=async function(kind){var name=prompt(pfT('नयाँ खर्च श्रेणीको नाम:','New expense category name:'));if(!name||!name.trim())return;try{await pfInsert('personal_categories',{user_id:pfUid(),kind:kind,name:name.trim()});await window.renderPersonalAll();}catch(e){alert(e.message);}};
window.addPersonalAccount=async function(){
 var name=(document.getElementById('pfAccountName').value||'').trim(),type=document.getElementById('pfAccountType').value,opening=Number(document.getElementById('pfOpening').value)||0,sav=document.getElementById('pfIsSavings').checked;
 if(!name)return alert('Enter account name');
 try{await pfInsert('personal_accounts',{user_id:pfUid(),name:name,account_type:type,opening_balance:opening,is_savings:sav});document.getElementById('pfAccountName').value='';document.getElementById('pfOpening').value='0';document.getElementById('pfIsSavings').checked=false;await window.renderPersonalAll();}catch(e){alert(e.message);}
};
function pfRenderAccounts(){
 var el=document.getElementById('pfAccountCards');if(el)el.innerHTML=pf.accounts.map(function(a){return '<article class="pf-account-card"><strong>'+pfEsc(a.name)+'</strong><small>'+pfEsc(a.account_type.toUpperCase())+(a.is_savings?' · SAVINGS':'')+'</small><div class="pf-balance">'+pfMoney(pfAccBalance(a))+'</div><small>Opening: '+pfMoney(a.opening_balance)+'</small></article>';}).join('');
 pfPopulate();window.renderPersonalAccountHistory();
}
window.renderPersonalAccountHistory=function(){
 var id=(document.getElementById('pfAccountHistorySelect')||{}).value||'',arr=pf.transactions.filter(function(t){return !id||t.account_id===id;}).sort(function(a,b){return String(b.occurred_on).localeCompare(String(a.occurred_on));});
 var el=document.getElementById('pfAccountHistoryRows');if(el)el.innerHTML=arr.map(function(t){return '<tr><td>'+pfDateLabel(t.occurred_on)+'</td><td>'+pfEsc(t.description)+'</td><td>'+pfEsc(pfTypeLabel(t.kind))+'</td><td class="pf-amount">'+pfMoney(t.amount)+'</td></tr>';}).join('')||'<tr><td colspan="4" class="pf-empty">No transactions</td></tr>';
};
window.savePersonalTransfer=async function(){
 var from=document.getElementById('pfTransferFrom').value,to=document.getElementById('pfTransferTo').value,amount=Number(document.getElementById('pfTransferAmount').value),date=document.getElementById('pfTransferDate').value||pfDate(),note=(document.getElementById('pfTransferNote').value||'').trim();
 if(pf.busyTransfer)return;
 if(!from||!to||from===to||!(amount>0))return alert('Choose two different accounts and enter a valid amount.');
 var source=pf.accounts.find(function(a){return a.id===from;});
 if(!source||pfAccBalance(source)<amount)return alert('Insufficient balance in the source account.');
 pf.busyTransfer=true;
 var id=crypto.randomUUID();var base={user_id:pfUid(),amount:amount,occurred_on:date,category:'Account Transfer',description:note||'Account transfer',note:note||null,transfer_id:id};
 try{await pfInsert('personal_transactions',[Object.assign({},base,{account_id:from,kind:'transfer_out'}),Object.assign({},base,{account_id:to,kind:'transfer_in'})]);document.getElementById('pfTransferAmount').value='';document.getElementById('pfTransferNote').value='';await window.renderPersonalAll();alert('Transfer completed.');}catch(e){alert('Transfer failed: '+e.message);}
 finally{pf.busyTransfer=false;}
};
function pfRenderTransfers(){
 var grouped={};pf.transactions.filter(function(t){return t.transfer_id;}).forEach(function(t){grouped[t.transfer_id]=grouped[t.transfer_id]||[];grouped[t.transfer_id].push(t);});
 var rows=Object.keys(grouped).map(function(k){var a=grouped[k],out=a.find(function(t){return t.kind==='transfer_out';}),inn=a.find(function(t){return t.kind==='transfer_in';});return out&&inn?'<tr><td>'+pfDateLabel(out.occurred_on)+'</td><td>'+pfEsc(pfAccountName(out.account_id))+'</td><td>'+pfEsc(pfAccountName(inn.account_id))+'</td><td class="pf-amount">'+pfMoney(out.amount)+'</td></tr>':'';}).join('');
 var el=document.getElementById('pfTransferRows');if(el)el.innerHTML=rows||'<tr><td colspan="4" class="pf-empty">No transfers yet</td></tr>';
}
window.addPersonalSavingsGoal=async function(){
 var title=(document.getElementById('pfGoalName').value||'').trim(),target=Number(document.getElementById('pfGoalTarget').value);
 if(!title||!(target>0))return alert('Enter a goal name and target amount.');
 try{await pfInsert('personal_savings_goals',{user_id:pfUid(),title:title,goal_type:document.getElementById('pfGoalType').value,target_amount:target,due_date:document.getElementById('pfGoalDate').value||null,note:document.getElementById('pfGoalNote').value||null});document.getElementById('pfGoalName').value='';document.getElementById('pfGoalTarget').value='';await window.renderPersonalAll();}catch(e){alert(e.message);}
};
window.addPersonalSavingsContribution=async function(){
 var goal=document.getElementById('pfContributionGoal').value,amount=Number(document.getElementById('pfContributionAmount').value);if(!goal||!(amount>0))return alert('Choose a goal and enter an amount.');
 try{await pfInsert('personal_savings_contributions',{user_id:pfUid(),goal_id:goal,amount:amount,contributed_on:document.getElementById('pfContributionDate').value||pfDate(),note:document.getElementById('pfContributionNote').value||null});document.getElementById('pfContributionAmount').value='';await window.renderPersonalAll();}catch(e){alert(e.message);}
};
window.deletePersonalSavingsGoal=async function(id){if(!confirm('Delete this goal and its contribution history?'))return;try{var q=await supa.from('personal_savings_goals').delete().eq('id',id).eq('user_id',pfUid());if(q.error)throw new Error(q.error.message);await window.renderPersonalAll();}catch(e){alert(e.message);}};
function pfRenderSavings(){
 var el=document.getElementById('pfSavingsGoals');if(el)el.innerHTML=pf.goals.map(function(g){var pct=Math.min(100,Number(g.saved_amount||0)/Number(g.target_amount||1)*100);return '<article class="pf-goal-card"><strong>'+pfEsc(g.title)+'</strong><small>'+pfEsc(g.goal_type.replace('_',' '))+' · Target '+pfMoney(g.target_amount)+'</small><div class="pf-progress"><span style="width:'+pct+'%"></span></div><div class="pf-break-row"><span>Saved '+pfMoney(g.saved_amount)+'</span><strong>'+pct.toFixed(1)+'%</strong></div><small>Remaining '+pfMoney(Math.max(0,Number(g.target_amount)-Number(g.saved_amount)))+' · Due '+pfDateLabel(g.due_date)+'</small><div class="pf-actions"><button class="pf-btn-muted" onclick="deletePersonalSavingsGoal(\''+g.id+'\')">Delete</button></div></article>';}).join('')||'<div class="pf-empty">Create your first savings goal</div>';
 pfSetOptions('pfContributionGoal',pf.goals.map(function(g){return {id:g.id,name:g.title};}),null);
}
window.addPersonalLoan=async function(){
 var type=document.getElementById('pfLoanType').value,party=(document.getElementById('pfLoanParty').value||'').trim(),principal=Number(document.getElementById('pfLoanPrincipal').value),account=document.getElementById('pfLoanAccount').value;
 if(!party||!(principal>0)||!account)return alert('Fill loan name, principal and account.');
 try{await pfInsert('personal_loans',{user_id:pfUid(),loan_type:type,party_name:party,principal:principal,interest_rate:Number(document.getElementById('pfLoanRate').value)||0,due_date:document.getElementById('pfLoanDue').value||null,account_id:account,note:document.getElementById('pfLoanNote').value||null});document.getElementById('pfLoanParty').value='';document.getElementById('pfLoanPrincipal').value='';await window.renderPersonalAll();}catch(e){alert(e.message);}
};
window.savePersonalLoanPayment=async function(){
 var loan=document.getElementById('pfPayLoan').value,account=document.getElementById('pfPayAccount').value,principal=Number(document.getElementById('pfPayPrincipal').value)||0,interest=Number(document.getElementById('pfPayInterest').value)||0;
 if(!loan||!account||principal<0||interest<0||principal+interest<=0)return alert('Select loan/account and enter repayment.');
 var l=pf.loans.find(function(x){return x.id===loan;});if(!l)return;
 if(principal>pfLoanRemaining(l))return alert('Principal payment is greater than outstanding principal.');
 try{await pfInsert('personal_loan_payments',{user_id:pfUid(),loan_id:loan,account_id:account,principal_amount:principal,interest_amount:interest,paid_on:document.getElementById('pfPayDate').value||pfDate(),note:document.getElementById('pfPayNote').value||null});document.getElementById('pfPayPrincipal').value='';document.getElementById('pfPayInterest').value='0';await window.renderPersonalAll();}catch(e){alert(e.message);}
};
window.deletePersonalLoanPayment=async function(id){if(!confirm('Delete this repayment record?'))return;try{var q=await supa.from('personal_loan_payments').delete().eq('id',id).eq('user_id',pfUid());if(q.error)throw new Error(q.error.message);await window.renderPersonalAll();}catch(e){alert(e.message);}};
window.deletePersonalLoan=async function(id){if(!confirm('Delete this loan and its repayment history? Ledger entries will also be recalculated.'))return;try{var q=await supa.from('personal_loans').delete().eq('id',id).eq('user_id',pfUid());if(q.error)throw new Error(q.error.message);await window.renderPersonalAll();}catch(e){alert(e.message);}};
function pfRenderLoans(){
 var el=document.getElementById('pfLoanCards');if(el)el.innerHTML=pf.loans.map(function(l){var paid=pfLoanPaid(l),remain=pfLoanRemaining(l),pct=Math.min(100,paid/Number(l.principal||1)*100);return '<article class="pf-goal-card"><strong>'+pfEsc(l.party_name)+' · '+(l.loan_type==='borrowed'?'Borrowed':'Lent')+'</strong><small>Principal '+pfMoney(l.principal)+' · Interest '+Number(l.interest_rate||0)+'% · Due '+pfDateLabel(l.due_date)+'</small><div class="pf-progress"><span style="width:'+pct+'%"></span></div><div class="pf-break-row"><span>Principal repaid '+pfMoney(paid)+'</span><strong>Remaining '+pfMoney(remain)+'</strong></div><small>Account: '+pfEsc(pfAccountName(l.account_id))+'</small><div class="pf-actions"><button class="pf-btn-muted" onclick="document.getElementById(\'pfPayLoan\').value=\''+l.id+'\';document.getElementById(\'perLoans\').scrollIntoView({behavior:\'smooth\'});">Record payment</button><button class="pf-btn-muted" onclick="deletePersonalLoan(\''+l.id+'\')">Delete</button></div></article>';}).join('')||'<div class="pf-empty">No loans recorded</div>';
 var el2=document.getElementById('pfPaymentRows');if(el2)el2.innerHTML=pf.payments.slice().sort(function(a,b){return String(b.paid_on).localeCompare(String(a.paid_on));}).map(function(p){var l=pf.loans.find(function(x){return x.id===p.loan_id;});return '<tr><td>'+pfDateLabel(p.paid_on)+'</td><td>'+pfEsc(l?l.party_name:'-')+'</td><td>'+pfMoney(p.principal_amount)+'</td><td>'+pfMoney(p.interest_amount)+'</td><td><button class="pf-danger" onclick="deletePersonalLoanPayment(\''+p.id+'\')">Delete</button></td></tr>';}).join('')||'<tr><td colspan="5" class="pf-empty">No repayments</td></tr>';
 pfPopulate();
}
window.renderPersonalReports=function(){
 var from=(document.getElementById('pfReportFrom')||{}).value||'',to=(document.getElementById('pfReportTo')||{}).value||'';
 var rows=pf.transactions.filter(function(t){return (!from||t.occurred_on>=from)&&(!to||t.occurred_on<=to);});
 var income=rows.filter(pfIncome).reduce(function(n,t){return n+Number(t.amount);},0),expense=rows.filter(pfExpense).reduce(function(n,t){return n+Number(t.amount);},0);
 [['pfReportIncome',income],['pfReportExpense',expense],['pfReportNet',income-expense]].forEach(function(x){var e=document.getElementById(x[0]);if(e)e.textContent=pfMoney(x[1]);});
 var cats={};rows.filter(function(t){return pfExpense(t);}).forEach(function(t){cats[t.category]=(cats[t.category]||0)+Number(t.amount);});
 var ce=document.getElementById('pfCategoryReport');if(ce)ce.innerHTML=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];}).map(function(k){return '<div class="pf-break-row"><span>'+pfEsc(k)+'</span><strong>'+pfMoney(cats[k])+'</strong></div>';}).join('')||'<p class="pf-empty">No expense categories in this period</p>';
 var ae=document.getElementById('pfAccountReport');if(ae){var totals={};rows.forEach(function(t){totals[pfAccountName(t.account_id)]=(totals[pfAccountName(t.account_id)]||0)+(pfTxIn(t)?Number(t.amount):-Number(t.amount));});ae.innerHTML=Object.keys(totals).map(function(k){return '<div class="pf-break-row"><span>'+pfEsc(k)+'</span><strong>'+pfMoney(totals[k])+'</strong></div>';}).join('')||'<p class="pf-empty">No account activity</p>';}
 var body=document.getElementById('pfReportRows');if(body)body.innerHTML=rows.slice().sort(function(a,b){return String(b.occurred_on).localeCompare(String(a.occurred_on));}).map(function(t){return '<tr><td>'+pfDateLabel(t.occurred_on)+'</td><td>'+pfEsc(t.description)+'</td><td>'+pfEsc(t.category)+'</td><td>'+pfEsc(pfAccountName(t.account_id))+'</td><td>'+pfEsc(pfTypeLabel(t.kind))+'</td><td>'+pfMoney(t.amount)+'</td></tr>';}).join('')||'<tr><td colspan="6" class="pf-empty">No report data</td></tr>';
 var chart=document.getElementById('pfReportChart');if(chart)chart.innerHTML='<div class="pf-bars"><div class="pf-bar-col"><div class="pf-bar-pair"><span class="pf-bar" style="height:'+Math.max(2,income/Math.max(1,income,expense)*100)+'%"></span></div><small>Income</small></div><div class="pf-bar-col"><div class="pf-bar-pair"><span class="pf-bar exp" style="height:'+Math.max(2,expense/Math.max(1,income,expense)*100)+'%"></span></div><small>Expenses</small></div></div>';
};
window.applyPersonalReportPreset=function(v){
 var now=new Date(),from=new Date(now),to=pfDate();
 if(v==='today')from=new Date(now);
 else if(v==='week'){from.setDate(now.getDate()-6);}
 else if(v==='month')from=new Date(now.getFullYear(),now.getMonth(),1);
 else if(v==='year')from=new Date(now.getFullYear(),0,1);
 else {document.getElementById('pfReportFrom').value='';document.getElementById('pfReportTo').value='';window.renderPersonalReports();return;}
 document.getElementById('pfReportFrom').value=from.toISOString().slice(0,10);document.getElementById('pfReportTo').value=to;window.renderPersonalReports();
};
window.exportPersonalCSV=function(){
 var rows=pf.transactions.slice().sort(function(a,b){return String(a.occurred_on).localeCompare(String(b.occurred_on));});
 var csv=[['Date','Description','Type','Category','Account','Amount NPR','Note']].concat(rows.map(function(t){return [t.occurred_on,t.description,pfTypeLabel(t.kind),t.category,pfAccountName(t.account_id),t.amount,t.note||''];}));
 var content='\ufeff'+csv.map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(',');}).join('\r\n');
 var blob=new Blob([content],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='HamroKarobar-Personal-Finance.csv';a.click();URL.revokeObjectURL(url);
};
window.printPersonalReport=function(){var node=document.getElementById('perReports');if(!node)return;var w=window.open('','_blank','width=1000,height=750');if(!w)return alert('Allow pop-ups to print the report.');w.document.write('<html><head><title>Personal Finance Report</title><link rel="stylesheet" href="personal-finance.css"><style>body{padding:20px;font-family:Arial}.pf-actions{display:none!important}</style></head><body>'+node.innerHTML+'</body></html>');w.document.close();w.focus();w.print();};
function pfRenderPage(id){
 if(!pf.ready){window.renderPersonalAll().then(function(){pfShow(id);});return;}
 pfShow(id);
}
function pfShow(id){
 document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
 var target=document.getElementById(id);if(target)target.classList.add('active');
 var navEl=document.getElementById('nav');if(navEl){navEl.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.dataset.target===id);});}
 if(id==='perDash')pfDashboard();
 if(id==='perInc'||id==='perExp')window.renderPersonalTables();
 if(id==='perAccounts')pfRenderAccounts();
 if(id==='perTransfers')pfRenderTransfers();
 if(id==='perSavings')pfRenderSavings();
 if(id==='perLoans')pfRenderLoans();
 if(id==='perReports')window.renderPersonalReports();
 if(window.innerWidth<=820&&sidebar){sidebar.classList.add('hidden');sidebar.classList.remove('open');}
}
var navEl=document.getElementById('nav');
if(navEl)navEl.addEventListener('click',function(e){
 var btn=e.target.closest('button[data-mode="personal"]');if(!btn)return;
 if((window.appMode||appMode)!=='personal')return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 var id=btn.dataset.target;pfRenderPage(id);
},true);
window.addEventListener('load',function(){
 window.applyPersonalFinanceLanguage();
 ['piDate','peDate','pfTransferDate','pfContributionDate','pfPayDate'].forEach(function(id){var e=document.getElementById(id);if(e&&!e.value)e.value=pfDate();});
 var oldRender=window.renderPersonalAll;
 // When the Personal workspace is already selected on session restore, hydrate its real DB records.
 if((window.appMode||appMode)==='personal')oldRender();
});
})();