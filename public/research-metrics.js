(function(){
'use strict';

var FALLBACK={
  updated:'May 2026',
  googleScholar:{
    profile:'https://scholar.google.com/citations?hl=en&user=vwCkGDgAAAAJ',
    citations:11,hIndex:3,i10Index:0,sinceYear:2021,sinceCitations:11,sinceHIndex:3,sinceI10Index:0,
    yearlyCitations:[{year:'2025',value:8},{year:'2026',value:3}]
  },
  researchGate:{
    profile:'https://www.researchgate.net/profile/Sai-Nalla-3',
    researchInterestScore:5.3,reads:145,readsDelta:2,citations:3,recommendations:0,
    fullTextReads:25,otherReads:120,higherThanAllMembersPercent:19,higherThanFirstPubYearPercent:29,firstPublicationYear:2021
  },
  orcid:{profile:'https://orcid.org/0000-0002-8044-6330',id:'0000-0002-8044-6330',name:'Sai Kiran Kumar Nalla'}
};

function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function metricStat(num,label){
  return '<div class="metric-stat"><div class="metric-num">'+esc(num)+'</div><div class="metric-label">'+esc(label)+'</div></div>';
}

function render(data){
  var g=data.googleScholar||FALLBACK.googleScholar;
  var r=data.researchGate||FALLBACK.researchGate;
  var o=data.orcid||FALLBACK.orcid;
  var updated=data.updated||FALLBACK.updated;

  var grid=document.getElementById('researchMetricsGrid');
  if(grid){
    grid.innerHTML =
      '<article class="metric-card">'+
        '<div><div class="metric-source">Google Scholar</div><h3>Citation profile</h3><div class="metric-id">Updated '+esc(updated)+'</div>'+
        '<div class="metric-stats">'+
          metricStat(g.citations,'Citations')+
          metricStat(g.hIndex,'h-index')+
          metricStat(g.i10Index,'i10-index')+
        '</div>'+
        '<div class="metric-row"><span>Since '+esc(g.sinceYear)+'</span><b>'+esc(g.sinceCitations)+' citations · h '+esc(g.sinceHIndex)+'</b></div></div>'+
        '<div class="metric-actions"><a class="metric-link" href="'+esc(g.profile)+'" target="_blank" rel="noopener">Open Scholar ↗</a></div>'+
      '</article>'+

      '<article class="metric-card">'+
        '<div><div class="metric-source">ResearchGate</div><h3>Research visibility</h3><div class="metric-id">Updated '+esc(updated)+'</div>'+
        '<div class="metric-stats">'+
          metricStat(r.researchInterestScore,'RI Score')+
          metricStat(r.reads,'Reads')+
          metricStat(r.citations,'Citations')+
        '</div>'+
        '<div class="metric-row"><span>Reads change</span><b>+'+esc(r.readsDelta)+' last update</b></div>'+
        '<div class="metric-row"><span>Recommendations</span><b>'+esc(r.recommendations)+'</b></div></div>'+
        '<div class="metric-actions"><a class="metric-link" href="'+esc(r.profile)+'" target="_blank" rel="noopener">Open ResearchGate ↗</a></div>'+
      '</article>'+

      '<article class="metric-card">'+
        '<div><div class="metric-source">ORCID</div><h3>Verified researcher identity</h3><div class="metric-id">'+esc(o.id)+'</div>'+
        '<div class="metric-row"><span>Name</span><b>'+esc(o.name)+'</b></div>'+
        '<div class="metric-row"><span>Purpose</span><b>Persistent author ID</b></div>'+
        '<div class="metric-row"><span>Use</span><b>Publication identity &amp; disambiguation</b></div></div>'+
        '<div class="metric-actions"><a class="metric-link" href="'+esc(o.profile)+'" target="_blank" rel="noopener">Open ORCID ↗</a></div>'+
      '</article>';
  }

  var breakdown=document.getElementById('researchMetricsBreakdown');
  if(breakdown){
    var totalReads=Math.max(1,(Number(r.fullTextReads)||0)+(Number(r.otherReads)||0));
    var fullPct=Math.round((Number(r.fullTextReads)||0)/totalReads*100);
    var otherPct=Math.round((Number(r.otherReads)||0)/totalReads*100);
    var maxYear=Math.max.apply(null,(g.yearlyCitations||[]).map(function(x){return Number(x.value)||0;}).concat([1]));

    breakdown.innerHTML =
      '<article class="breakdown-card">'+
        '<h3>ResearchGate reads breakdown</h3>'+
        '<div class="breakdown-list">'+
          '<div class="breakdown-item"><span>Full-text reads</span><div class="breakdown-bar"><div class="breakdown-fill" style="width:'+fullPct+'%"></div></div><span class="breakdown-value">'+esc(r.fullTextReads)+'</span></div>'+
          '<div class="breakdown-item"><span>Other reads</span><div class="breakdown-bar"><div class="breakdown-fill" style="width:'+otherPct+'%"></div></div><span class="breakdown-value">'+esc(r.otherReads)+'</span></div>'+
          '<div class="breakdown-item"><span>All members</span><div class="breakdown-bar"><div class="breakdown-fill" style="width:'+esc(r.higherThanAllMembersPercent)+'%"></div></div><span class="breakdown-value">Top '+esc(100-r.higherThanAllMembersPercent)+'%</span></div>'+
          '<div class="breakdown-item"><span>First pub '+esc(r.firstPublicationYear)+'</span><div class="breakdown-bar"><div class="breakdown-fill" style="width:'+esc(r.higherThanFirstPubYearPercent)+'%"></div></div><span class="breakdown-value">Higher than '+esc(r.higherThanFirstPubYearPercent)+'%</span></div>'+
        '</div>'+
      '</article>'+

      '<article class="breakdown-card">'+
        '<h3>Google Scholar citation timeline</h3>'+
        '<div class="breakdown-list">'+
        (g.yearlyCitations||[]).map(function(item){
          var pct=Math.round((Number(item.value)||0)/maxYear*100);
          return '<div class="breakdown-item"><span>'+esc(item.year)+'</span><div class="breakdown-bar"><div class="breakdown-fill" style="width:'+pct+'%"></div></div><span class="breakdown-value">'+esc(item.value)+'</span></div>';
        }).join('')+
        '</div>'+
        '<div class="metric-small">Manual snapshot from public profile metrics</div>'+
      '</article>';
  }
}

async function init(){
  try{
    var res=await fetch('research-metrics.json',{cache:'no-store'});
    if(!res.ok)throw new Error('metrics file not found');
    render(await res.json());
  }catch(e){
    render(FALLBACK);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}
})();
