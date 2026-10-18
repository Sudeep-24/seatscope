document.addEventListener('DOMContentLoaded',()=>{
'use strict';

/* SPEED: remember the answer for text values that repeat
   thousands of times in the database (same result, much faster) */
function memoStr(fn){
  const cache=new Map();
  return v=>{
    if(typeof v!=='string')return fn(v);
    let r=cache.get(v);
    if(r===undefined){
      r=fn(v);
      cache.set(v,r);
    }
    return r;
  };
}

const $=id=>document.getElementById(id),
clean=memoStr(v=>String(v??'').trim().replace(/\s+/g,' ')),
norm=memoStr(v=>clean(v).toLowerCase()),
compact=memoStr(v=>norm(v).replace(/[^a-z0-9]+/g,'')),
num=v=>{
  const n=Number(String(v??'').replace(/,/g,''));
  return Number.isFinite(n)?n:null
},
fmt=v=>{
  const n=num(v);
  return n==null?'—':n.toLocaleString('en-IN')
},
esc=v=>String(v??'').replace(/[&<>'"]/g,m=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  "'":'&#039;',
  '"':'&quot;'
}[m]));

const form=$('counsellingForm'),
rankInput=$('rank'),
categorySelect=$('category'),
seatTypeSelect=$('seatType'),
courseGroupSelect=$('courseGroup'),
branchSelect=$('branch'),
locationInput=$('location'),
roundSelect=$('round');

const resultsSection=$('results'),
resultRank=$('resultRank'),
resultCategory=$('resultCategory'),
resultCourse=$('resultCourse'),
resultYearRound=$('resultYearRound'),
resultHistoricalText=$('resultHistoricalText');

const highCount=$('highCount'),
moderateCount=$('moderateCount'),
ambitiousCount=$('ambitiousCount'),
totalCount=$('totalCount'),
highCollegeList=$('highCollegeList'),
moderateCollegeList=$('moderateCollegeList'),
ambitiousCollegeList=$('ambitiousCollegeList');

const findOptionsBtn=$('findOptionsBtn'),
learnMoreBtn=$('learnMoreBtn'),
clearChoiceListBtn=$('clearChoiceListBtn'),
exportPdfBtn=$('exportPdfBtn'),
exportExcelBtn=$('exportExcelBtn'),
dreamChoices=$('dreamChoices'),
realisticChoices=$('realisticChoices'),
safeChoices=$('safeChoices');

let data=[],
loaded=false;

const STORAGE_KEY='seatscopeChoiceList';


/* =========================================================
   DATA HELPERS
========================================================= */

const field=(r,n)=>{
  for(const k of n){
    if(
      r[k]!==undefined &&
      r[k]!==null &&
      clean(r[k])!==''
    ){
      return clean(r[k]);
    }
  }
  return '';
};

const getGroup=r=>field(r,['courseGroup']);

const getCollegeCode=r=>
  field(r,['collegeCode','code']);

const getCollegeName=r=>
  field(r,[
    'collegeName',
    'college',
    'instituteName'
  ])||'Unknown College';

const getBranch=r=>
  field(r,[
    'branch',
    'course',
    'courseName',
    'program'
  ]);

const getCategory=r=>
  field(r,[
    'category',
    'categoryCode',
    'cat'
  ]);

const getSeat=r=>
  field(r,[
    'seatType',
    'quota',
    'seat',
    'seatCategory'
  ]);

const getCity=r=>
  field(r,[
    'city',
    'location',
    'district'
  ]);

const getYear=r=>num(r.year);

const getClosing=r=>
  num(
    field(r,[
      'closingRank',
      'closing',
      'closeRank',
      'closing_rank'
    ])
  );


/* =========================================================
   ROUND
========================================================= */

function roundName(v){

  const s=norm(v);

  if(!s)return '';

  if(
    s.includes('round 1')||
    s==='r1'||
    s==='1'
  ){
    return 'Round 1';
  }

  if(
    s.includes('round 2')||
    s==='r2'||
    s==='2'
  ){
    return 'Round 2';
  }

  if(
    s.includes('round 3')||
    s==='r3'||
    s==='3'
  ){
    return 'Round 3';
  }

  if(
    s.includes('final')||
    s.includes('extended')
  ){
    return 'Final / Extended';
  }

  return clean(v);
}


/* =========================================================
   ENGINEERING BRANCH GROUPS
========================================================= */

const engineeringGroups=[

[
'Computer Science & Engineering',
[
'computer science and engineering',
'computer science engineering',
'computer science',
'cse'
]
],

[
'Information Science & Engineering',
[
'information science and engineering',
'information science',
'info science',
'ise'
]
],

[
'Information Technology',
[
'information technology',
'information tech',
'information technology engineering',
'it'
]
],

[
'Artificial Intelligence & Data Science',
[
'artificial intelligence and data science',
'artificial intelligence data science',
'ai and data science',
'data science',
'aids'
]
],

[
'Artificial Intelligence & Machine Learning',
[
'artificial intelligence and machine learning',
'artificial intelligence machine learning',
'ai and machine learning',
'machine learning',
'aiml'
]
],

[
'Cyber Security',
[
'cyber security',
'cybersecurity',
'cyber security engineering'
]
],

[
'Electronics & Communication Engineering',
[
'electronics and communication engineering',
'electronics and communication',
'electronics communication',
'electronics and telecommunication',
'electronics telecommunication',
'ece'
]
],

[
'Electrical & Electronics Engineering',
[
'electrical and electronics engineering',
'electrical and electronics',
'eee'
]
],

[
'Mechanical Engineering',
[
'mechanical engineering',
'mechanical'
]
],

[
'Civil Engineering',
[
'civil engineering',
'civil'
]
],

[
'Chemical Engineering',
[
'chemical engineering',
'chemical'
]
],

[
'Biotechnology',
[
'biotechnology',
'bio technology'
]
],

[
'Industrial Engineering',
[
'industrial engineering',
'industrial and production',
'industrial production'
]
],

[
'Instrumentation Engineering',
[
'instrumentation engineering',
'instrumentation'
]
],

[
'Robotics & Automation',
[
'robotics and automation',
'robotics automation',
'robotics'
]
],

[
'Aerospace / Aeronautical Engineering',
[
'aerospace engineering',
'aeronautical engineering',
'aerospace',
'aeronautical'
]
],

[
'Automobile Engineering',
[
'automobile engineering',
'automobile'
]
],

[
'Agricultural Engineering',
[
'agricultural engineering',
'agriculture engineering'
]
]

];


const engineeringBranchCache=new Map();

function engineeringBranch(v){

  if(typeof v==='string'){

    let r=engineeringBranchCache.get(v);

    if(r===undefined){
      r=engineeringBranchRaw(v);
      engineeringBranchCache.set(v,r);
    }

    return r;

  }

  return engineeringBranchRaw(v);

}


function engineeringBranchRaw(v){

  v=compact(v);

  for(
    const [n,ks]
    of engineeringGroups
  ){

    if(
      ks.some(
        k=>
          v===compact(k)||
          v.includes(compact(k))||
          compact(k).includes(v)
      )
    ){
      return n;
    }

  }

  return 'Other Engineering';
}


function isEngineering(){

  return (
    norm(courseGroupSelect?.value)===
    'engineering'
  );

}


function branchMatches(r,b){

  if(!b)return true;

  return isEngineering()
    ? engineeringBranch(
        getBranch(r)
      )===b
    : compact(
        getBranch(r)
      )===compact(b);

}


/* =========================================================
   DROPDOWNS
========================================================= */

function setOptions(
  s,
  p,
  values
){

  if(!s)return;

  const old=s.value;

  s.innerHTML=
    `<option value="">${p}</option>`;

  values.forEach(v=>{

    const o=
      document.createElement(
        'option'
      );

    o.value=v;
    o.textContent=v;

    s.appendChild(o);

  });

  if(values.includes(old)){
    s.value=old;
  }

}


function recordsForDropdown(){

  return data.filter(
    r=>
      !courseGroupSelect.value||
      norm(getGroup(r))===
      norm(courseGroupSelect.value)
  );

}


function populateCourseGroups(){

  setOptions(
    courseGroupSelect,
    'Select Course Group',
    [
      ...new Set(
        data
          .map(getGroup)
          .filter(Boolean)
      )
    ].sort()
  );

}


function updateBranches(){

  let rs=
    recordsForDropdown();

  let values;


  if(isEngineering()){

    values=[
      ...new Set(
        rs
          .map(
            r=>
              engineeringBranch(
                getBranch(r)
              )
          )
          .filter(Boolean)
      )
    ];

    const order=
      engineeringGroups
        .map(x=>x[0])
        .concat(
          'Other Engineering'
        );

    values.sort(
      (a,b)=>
        order.indexOf(a)-
        order.indexOf(b)
    );

  }else{

    values=[
      ...new Set(
        rs
          .map(getBranch)
          .filter(Boolean)
      )
    ].sort();

  }


  setOptions(
    branchSelect,
    'All branches / courses',
    values
  );

}


function updateCategories(){

  setOptions(
    categorySelect,
    'Select Category',
    [
      ...new Set(
        recordsForDropdown()
          .filter(
            r=>
              branchMatches(
                r,
                branchSelect.value
              )
          )
          .map(getCategory)
          .filter(Boolean)
      )
    ].sort()
  );

}


function updateSeats(){

  setOptions(
    seatTypeSelect,
    'All Seat Types',
    [
      ...new Set(
        recordsForDropdown()
          .filter(
            r=>
              branchMatches(
                r,
                branchSelect.value
              )&&
              (
                !categorySelect.value||
                norm(getCategory(r))===
                norm(categorySelect.value)
              )
          )
          .map(getSeat)
          .filter(Boolean)
      )
    ].sort()
  );

}


function updateRounds(){

  const values=[
    ...new Set(
      recordsForDropdown()
        .filter(
          r=>
            branchMatches(
              r,
              branchSelect.value
            )&&
            (
              !categorySelect.value||
              norm(getCategory(r))===
              norm(categorySelect.value)
            )&&
            (
              !seatTypeSelect.value||
              norm(getSeat(r))===
              norm(seatTypeSelect.value)
            )
        )
        .map(
          r=>
            roundName(r.round)
        )
        .filter(Boolean)
    )
  ];

  const order=[
    'Round 1',
    'Round 2',
    'Round 3',
    'Final / Extended'
  ];

  setOptions(
    roundSelect,
    'Select Counselling Round',
    order
      .filter(
        x=>values.includes(x)
      )
      .concat(
        values.filter(
          x=>!order.includes(x)
        )
      )
  );

}


courseGroupSelect?.addEventListener(
  'change',
  ()=>{
    updateBranches();
    updateCategories();
    updateSeats();
    updateRounds();
  }
);


branchSelect?.addEventListener(
  'change',
  ()=>{
    updateCategories();
    updateSeats();
    updateRounds();
  }
);


categorySelect?.addEventListener(
  'change',
  ()=>{
    updateSeats();
    updateRounds();
  }
);


seatTypeSelect?.addEventListener(
  'change',
  updateRounds
);


/* =========================================================
   MATCHING
========================================================= */

function matching(){

  let rs=
    data.filter(
      r=>
        (
          !courseGroupSelect.value||
          norm(getGroup(r))===
          norm(courseGroupSelect.value)
        )&&
        branchMatches(
          r,
          branchSelect.value
        )&&
        (
          !categorySelect.value||
          norm(getCategory(r))===
          norm(categorySelect.value)
        )&&
        (
          !seatTypeSelect.value||
          norm(getSeat(r))===
          norm(seatTypeSelect.value)
        )&&
        (
          !roundSelect.value||
          roundName(r.round)===
          roundName(roundSelect.value)
        )
    );


  let loc=
    norm(locationInput.value);


  if(loc){

    const aliases={

      bengaluru:[
        'bengaluru',
        'bangalore'
      ],

      bangalore:[
        'bengaluru',
        'bangalore'
      ],

      mysuru:[
        'mysuru',
        'mysore'
      ],

      mysore:[
        'mysuru',
        'mysore'
      ],

      tumakuru:[
        'tumakuru',
        'tumkur'
      ],

      tumkur:[
        'tumakuru',
        'tumkur'
      ]

    };


    const allowed=
      aliases[loc]||[loc];


    rs=
      rs.filter(
        r=>
          allowed.some(
            w=>
              [
                getCity(r),
                field(
                  r,
                  [
                    'district',
                    'location'
                  ]
                )
              ]
              .map(norm)
              .filter(Boolean)
              .some(
                p=>
                  p===w||
                  p.includes(w)||
                  w.includes(p)
              )
          )
      );

  }


  return rs;

}


/* =========================================================
   BUILD RESULTS
========================================================= */

function build(
  records,
  studentRank
){

  const years=[
    ...new Set(
      records
        .map(getYear)
        .filter(
          x=>x!=null
        )
    )
  ]
  .sort(
    (a,b)=>b-a
  )
  .slice(0,5);


  const unique=
    new Map();


  records
    .filter(
      r=>
        years.includes(
          getYear(r)
        )
    )
    .forEach(
      r=>{

        const b=
          isEngineering()
          ?engineeringBranch(
              getBranch(r)
            )
          :getBranch(r);

        const k=
          `${compact(getCollegeCode(r))}|`+
          `${compact(b)}|`+
          `${getYear(r)}`;

        const old=
          unique.get(k);


        if(
          !old||
          norm(
            field(
              r,
              [
                'verificationStatus'
              ]
            )
          )===
          'official_source_verified'
        ){

          unique.set(
            k,
            r
          );

        }

      }
    );


  const colleges=
    new Map();


  [
    ...unique.values()
  ].forEach(
    r=>{

      const b=
        isEngineering()
        ?engineeringBranch(
            getBranch(r)
          )
        :getBranch(r);

      const c=
        getCollegeCode(r);

      const y=
        getYear(r);

      const cut=
        getClosing(r);


      if(
        !c||
        !b||
        y==null||
        cut==null
      ){
        return;
      }


      const k=
        `${compact(c)}|${compact(b)}`;


      if(
        !colleges.has(k)
      ){

        colleges.set(
          k,
          {
            code:c,
            name:getCollegeName(r),
            branch:b,
            city:getCity(r),
            category:getCategory(r),
            seat:getSeat(r),
            rows:[]
          }
        );

      }


      colleges
        .get(k)
        .rows
        .push({

          year:y,

          closing:cut,

          url:
            field(
              r,
              [
                'sourceUrl',
                'url'
              ]
            ),

          status:
            field(
              r,
              [
                'verificationStatus'
              ]
            ),

          round:
            roundName(r.round)

        });

    }
  );


  const output=[];


  colleges.forEach(
    c=>{

      c.rows.sort(
        (a,b)=>
          b.year-a.year
      );


      const latest=
        c.rows[0];


      const margin=
        latest.closing-
        studentRank;


      const ch=
        margin>=2000
        ?'High'
        :margin>=0
        ?'Moderate'
        :'Ambitious';


      output.push({

        ...c,

        cutoff:
          latest.closing,

        margin,

        chance:ch,

        latestYear:
          latest.year,

        usedYears:[
          ...new Set(
            c.rows.map(
              x=>x.year
            )
          )
        ].sort(
          (a,b)=>b-a
        ),

        url:
          latest.url,

        status:
          latest.status,

        latestRound:
          latest.round

      });

    }
  );


  const order={
    High:1,
    Moderate:2,
    Ambitious:3
  };


  output.sort(
    (a,b)=>
      order[a.chance]-
      order[b.chance]||
      b.cutoff-a.cutoff
  );


  return{
    results:output,
    years
  };

}


/* =========================================================
   CUTOFF HISTORY
========================================================= */

/* =========================================================
   HISTORICAL MATCH
   (share of available years in which this rank was at or
   inside the closing rank - NOT a probability of admission)
========================================================= */

function historicalMatch(rows,studentRank){

  const list=(rows||[]).filter(r=>r.closing!=null);

  if(!list.length||studentRank==null){
    return null;
  }

  const hit=list.filter(r=>r.closing>=studentRank).length;

  return {
    hit,
    total:list.length,
    percent:Math.round((hit/list.length)*100)
  };

}


function historyRows(item){

  const seen=new Map();

  data.forEach(r=>{

    const year=getYear(r);
    const closing=getClosing(r);

    if(year==null||closing==null)return;

    if(compact(getCollegeCode(r))!==compact(item.code))return;

    const b=isEngineering()
      ?engineeringBranch(getBranch(r))
      :getBranch(r);

    if(compact(b)!==compact(item.branch))return;

    if(
      item.category&&
      norm(getCategory(r))!==norm(item.category)
    )return;

    if(
      item.seat&&
      norm(getSeat(r))!==norm(item.seat)
    )return;

    if(
      courseGroupSelect.value&&
      norm(getGroup(r))!==norm(courseGroupSelect.value)
    )return;

    const round=roundName(r.round);

    const key=`${year}|${round}`;

    const old=seen.get(key);

    const verified=
      norm(field(r,['verificationStatus']))===
      'official_source_verified';

    if(!old||verified){

      seen.set(key,{
        year,
        round,
        closing,
        url:field(r,['sourceUrl','url']),
        status:field(r,['verificationStatus'])
      });

    }

  });

  return [...seen.values()].sort(
    (a,b)=>
      b.year-a.year||
      String(a.round).localeCompare(String(b.round))
  );

}


function buildHistoryHtml(item,studentRank){

  const rows=historyRows(item);

  if(!rows.length){
    return '<p class="history-empty">No historical records available.</p>';
  }

  const scale=Math.max(
    studentRank||0,
    ...rows.map(r=>r.closing)
  )||1;

  const marker=studentRank!=null
    ?Math.min(100,(studentRank/scale)*100)
    :null;

  const lines=rows.map(r=>{

    const margin=studentRank!=null
      ?r.closing-studentRank
      :null;

    const label=margin==null
      ?''
      :margin>=2000
      ?'High'
      :margin>=0
      ?'Moderate'
      :'Ambitious';

    const width=Math.max(2,(r.closing/scale)*100);

    return `
      <div class="history-row">
        <div class="history-year">${esc(r.year)}<small>${esc(r.round||'')}</small></div>
        <div class="history-bar-area">
          <div class="history-bar ${label.toLowerCase()}" style="width:${width}%"></div>
          ${marker!=null?`<div class="history-marker" style="left:${marker}%"></div>`:''}
        </div>
        <div class="history-rank">${fmt(r.closing)}</div>
        <div class="history-margin">
          ${margin==null?'':`${margin>=0?'+':''}${fmt(margin)}`}
        </div>
        <div class="history-label ${label.toLowerCase()}">${esc(label)}</div>
      </div>
    `;

  }).join('');


  let trend='';

  if(rows.length>=2){

    const newest=rows[0];
    const oldest=rows[rows.length-1];

    const diff=newest.closing-oldest.closing;

    trend=
      diff===0
      ?`Closing rank was the same in the first and last listed entries.`
      :`Listed closing ranks go from ${fmt(oldest.closing)} (${esc(oldest.year)} ${esc(oldest.round||'')}) to ${fmt(newest.closing)} (${esc(newest.year)} ${esc(newest.round||'')}). Different rounds are not directly comparable.`;

  }else{

    trend='Only one historical year is available for this option.';

  }


  const round='';

  return `
    <div class="history-head">
      <strong>Cutoff History</strong>
      ${round}
      <span>Category: ${esc(item.category||categorySelect.value)}</span>
      <span>Seat: ${esc(item.seat||seatTypeSelect.value||'All')}</span>
    </div>

    <div class="history-legend">
      <span>Year</span>
      <span>Closing rank (bar)</span>
      <span>Closing</span>
      <span>Margin</span>
      <span>Indicator</span>
    </div>

    ${lines}

    ${marker!=null?`<p class="history-key"><i></i> Vertical line = your rank (${fmt(studentRank)})</p>`:''}

    ${(()=>{
      const m=historicalMatch(rows,studentRank);
      return m
        ?`<p class="history-trend">Across the ${m.total} listed record${m.total===1?'':'s'}, your rank was within the closing rank in ${m.hit} (${m.percent}%).</p>`
        :'';
    })()}

    <p class="history-trend">${trend}</p>

    <p class="history-note">
      Based on the verified historical records available in SeatScope.
      Past cutoffs are historical indicators only and do not
      guarantee admission.
    </p>
  `;

}


/* =========================================================
   RESULT CARD
========================================================= */

function createCard(
  item,
  studentRank
){

  const card=
    document.createElement(
      'div'
    );


  card.className=
    'college-card';


  card.innerHTML=`

    <div class="college-card-header">

      <div>

        <h3>
          ${esc(item.name)}
        </h3>

        <div class="college-code">
          ${esc(item.code)}
        </div>

      </div>


      <span
        class="chance-badge ${item.chance.toLowerCase()}"
      >
        ${esc(item.chance)}
      </span>

    </div>


    <div class="college-course">
      ${esc(item.branch)}
    </div>


    <div class="college-details">

      <div class="detail-item">

        <span>
          Historical Closing Rank
        </span>

        <strong>
          ${fmt(item.cutoff)}
        </strong>

      </div>


      <div class="detail-item">

        <span>
          Your Rank
        </span>

        <strong>
          ${fmt(studentRank)}
        </strong>

      </div>


      <div class="detail-item">

        <span>
          Cutoff Margin
        </span>

        <strong>
          ${item.margin>=0?'+':''}
          ${fmt(item.margin)}
        </strong>

      </div>

    </div>


    ${(()=>{

      const m=historicalMatch(item.rows,studentRank);

      if(!m)return '';

      const level=
        m.percent>=75?'high':
        m.percent>=40?'moderate':
        'ambitious';

      return `
        <div class="match-box">
          <div class="match-top">
            <span>Historical Match</span>
            <strong>${m.percent}%</strong>
          </div>
          <div class="match-track">
            <div class="match-fill ${level}" style="width:${m.percent}%"></div>
          </div>
          <small>
            Your rank was within the closing rank in
            ${m.hit} of ${m.total} available
            ${m.total===1?'year':'years'}.
            ${m.total<2?'Limited history - treat with caution. ':''}
            Not an admission probability.
          </small>
        </div>
      `;

    })()}


    <div class="college-tags">

      <span>
        📍 ${esc(item.city||'—')}
      </span>

      <span>
        Category:
        ${esc(
          item.category||
          categorySelect.value
        )}
      </span>

      <span>
        Seat:
        ${esc(
          item.seat||
          seatTypeSelect.value||
          'All'
        )}
      </span>

      <span>
        Latest Cutoff:
        ${item.latestYear}
      </span>

      <span>
        Historical Years:
        ${item.usedYears.join(', ')}
      </span>

    </div>


    <p class="historical-note">
      Historical indicator only.
      This is not an admission guarantee.
    </p>


    <div class="college-actions">

      ${
        item.url
        ?
        `
        <a
          class="source-btn"
          href="${esc(item.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source
        </a>
        `
        :''
      }


      <button
        type="button"
        class="choice-list-btn"
      >
        Add to Choice List
      </button>


      <button
        type="button"
        class="history-btn"
      >
        View Cutoff History
      </button>


    </div>


    <div class="history-panel" hidden></div>

  `;


  card
    .querySelector(
      '.choice-list-btn'
    )
    ?.addEventListener(
      'click',
      ()=>{
        addChoice(item);
      }
    );


  const historyBtn=card.querySelector('.history-btn');
  const historyPanel=card.querySelector('.history-panel');

  historyBtn?.addEventListener(
    'click',
    ()=>{

      if(historyPanel.hidden){

        historyPanel.innerHTML=
          buildHistoryHtml(item,studentRank);

        historyPanel.hidden=false;
        historyBtn.textContent='Hide Cutoff History';

      }else{

        historyPanel.hidden=true;
        historyBtn.textContent='View Cutoff History';

      }

    }
  );


  return card;

}


/* =========================================================
   SHOW RESULTS
========================================================= */

function show(
  bundle,
  studentRank
){

  highCollegeList.innerHTML='';
  moderateCollegeList.innerHTML='';
  ambitiousCollegeList.innerHTML='';


  const lists={
    High:highCollegeList,
    Moderate:moderateCollegeList,
    Ambitious:ambitiousCollegeList
  };


  const counts={
    High:0,
    Moderate:0,
    Ambitious:0
  };


  bundle.results.forEach(
    i=>{

      counts[i.chance]++;

      lists[i.chance]
        .appendChild(
          createCard(
            i,
            studentRank
          )
        );

    }
  );


  if(
    !bundle.results.length
  ){

    highCollegeList.innerHTML=`

      <div class="no-results">

        <h3>
          No matching colleges found
        </h3>

        <p>
          Try a broader branch,
          category, seat type or location.
        </p>

      </div>

    `;

  }


  highCount.textContent=
    counts.High;

  moderateCount.textContent=
    counts.Moderate;

  ambitiousCount.textContent=
    counts.Ambitious;

  totalCount.textContent=
    bundle.results.length;


  resultRank.textContent=
    fmt(studentRank);

  resultCategory.textContent=
    categorySelect.value;

  resultCourse.textContent=
    branchSelect.value||
    courseGroupSelect.value;

  resultYearRound.textContent=
    roundName(
      roundSelect.value
    );


  resultHistoricalText.textContent=
    `Historical indication based on the latest ${bundle.years.length} available year(s). The displayed closing rank is from the latest available year.`;


  resultsSection.hidden=false;

  resultsSection.style.display=
    'block';


  resultsSection.scrollIntoView({
    behavior:'smooth'
  });

}


/* =========================================================
   FORM SUBMIT
========================================================= */

form?.addEventListener(
  'submit',
  e=>{

    e.preventDefault();


    if(!loaded){

      return alert(
        'Please wait for the cutoff database to finish loading.'
      );

    }


    const rank=
      num(rankInput.value);


    if(
      !rank||
      rank<=0
    ){

      return alert(
        'Please enter a valid rank.'
      );

    }


    if(
      !courseGroupSelect.value
    ){

      return alert(
        'Please select a Course Group.'
      );

    }


    if(
      !categorySelect.value
    ){

      return alert(
        'Please select a Category.'
      );

    }


    if(
      !roundSelect.value
    ){

      return alert(
        'Please select a Counselling Round.'
      );

    }


    show(
      build(
        matching(),
        rank
      ),
      rank
    );

  }
);


/* =========================================================
   CHOICE LIST
========================================================= */

function getChoices(){

  try{

    return JSON.parse(
      localStorage.getItem(
        STORAGE_KEY
      )||'[]'
    );

  }catch{

    return [];

  }

}


function saveChoices(x){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(x)
  );

  renderChoices();

}


function addChoice(item){

  let x=
    getChoices();


  if(
    x.some(
      a=>
        a.code===item.code&&
        a.branch===item.branch
    )
  ){

    return alert(
      'This college is already in your Choice List.'
    );

  }


  const type=
    item.chance==='High'
    ?'Safe'
    :item.chance==='Moderate'
    ?'Realistic'
    :'Dream';


  x.push({

    ...item,

    id:
      `${item.code}|${item.branch}`,

    type

  });


  saveChoices(x);


  alert(
    `${item.name} added to your ${type} choices.`
  );

}


function moveChoice(
  code,
  branch,
  direction
){

  let x=
    getChoices();


  let i=
    x.findIndex(
      a=>
        a.code===code&&
        a.branch===branch
    );


  if(i<0)return;


  const type=
    x[i].type;


  const idx=
    x
      .map(
        (a,j)=>
          a.type===type
          ?j
          :null
      )
      .filter(
        j=>j!==null
      );


  const p=
    idx.indexOf(i);


  const t=
    idx[p+direction];


  if(t===undefined)return;


  [
    x[i],
    x[t]
  ]=[
    x[t],
    x[i]
  ];


  saveChoices(x);

}


function removeChoice(
  code,
  branch
){

  saveChoices(
    getChoices().filter(
      a=>
        !(
          a.code===code&&
          a.branch===branch
        )
    )
  );

}


function renderGroup(
  el,
  items
){

  if(!el)return;


  el.innerHTML=
    items.length
    ?''
    :
    '<p class="empty-choice-list">No choices added yet.</p>';


  items.forEach(
    (item,i)=>{

      const d=
        document.createElement(
          'div'
        );


      d.className=
        'choice-list-item';


      d.innerHTML=`

        <strong>
          ${i+1}.
          ${esc(item.name)}
        </strong>

        <span>
          ${esc(item.code)}
          ·
          ${esc(item.branch)}
        </span>


        <div
          class="choice-order-buttons"
        >

          <button
            type="button"
            class="move-choice-btn"
            ${i===0?'disabled':''}
          >
            ↑
          </button>


          <button
            type="button"
            class="move-choice-btn"
            ${i===items.length-1?'disabled':''}
          >
            ↓
          </button>


          <button
            type="button"
            class="remove-choice-btn"
          >
            Remove
          </button>

        </div>

      `;


      const bs=
        d.querySelectorAll(
          '.move-choice-btn'
        );


      bs[0]?.addEventListener(
        'click',
        ()=>{
          moveChoice(
            item.code,
            item.branch,
            -1
          );
        }
      );


      bs[1]?.addEventListener(
        'click',
        ()=>{
          moveChoice(
            item.code,
            item.branch,
            1
          );
        }
      );


      d.querySelector(
        '.remove-choice-btn'
      )?.addEventListener(
        'click',
        ()=>{
          removeChoice(
            item.code,
            item.branch
          );
        }
      );


      el.appendChild(d);

    }
  );

}


function renderChoices(){

  const x=
    getChoices();


  renderGroup(
    dreamChoices,
    x.filter(
      a=>a.type==='Dream'
    )
  );


  renderGroup(
    realisticChoices,
    x.filter(
      a=>a.type==='Realistic'
    )
  );


  renderGroup(
    safeChoices,
    x.filter(
      a=>a.type==='Safe'
    )
  );

}


clearChoiceListBtn?.addEventListener(
  'click',
  ()=>{

    if(
      confirm(
        'Clear your entire Choice List?'
      )
    ){

      localStorage.removeItem(
        STORAGE_KEY
      );

      renderChoices();

    }

  }
);


/* =========================================================
   CHOICE LIST EXPORT
========================================================= */

function buildChoiceTable(){

  const x=
    getChoices();


  const groups={
    dream:
      x.filter(
        a=>a.type==='Dream'
      ),

    realistic:
      x.filter(
        a=>a.type==='Realistic'
      ),

    safe:
      x.filter(
        a=>a.type==='Safe'
      )
  };


  let html=`

    <table>

      <thead>

        <tr>

          <th>No.</th>
          <th>Type</th>
          <th>College</th>
          <th>Code</th>
          <th>Branch</th>
          <th>City</th>
          <th>Closing Rank</th>
          <th>Margin</th>
          <th>Year</th>

        </tr>

      </thead>

      <tbody>

  `;


  let n=0;


  for(
    const [type,arr]
    of Object.entries(groups)
  ){

    arr.forEach(
      a=>{

        n++;


        html+=`

          <tr>

            <td>
              ${n}
            </td>

            <td>
              ${esc(type)}
            </td>

            <td>
              ${esc(a.name)}
            </td>

            <td>
              ${esc(a.code)}
            </td>

            <td>
              ${esc(a.branch)}
            </td>

            <td>
              ${esc(a.city)}
            </td>

            <td>
              ${fmt(a.cutoff)}
            </td>

            <td>
              ${a.margin>=0?'+':''}
              ${fmt(a.margin)}
            </td>

            <td>
              ${a.latestYear||''}
            </td>

          </tr>

        `;

      }
    );

  }


  return (
    html+
    '</tbody></table>'
  );

}


exportPdfBtn?.addEventListener(
  'click',
  ()=>{

    if(
      !getChoices().length
    ){

      return alert(
        'Your choice list is empty. Add some colleges first.'
      );

    }


    const w=
      window.open(
        '',
        '_blank'
      );


    if(!w){

      return alert(
        'Please allow pop-ups.'
      );

    }


    w.document.write(`

      <html>

      <head>

        <title>
          SeatScope Choice List
        </title>

        <style>

          body{
            font-family:Arial;
            padding:25px;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          th,td{
            border:1px solid #bbb;
            padding:7px;
            text-align:left;
            font-size:11px;
          }

          th{
            background:#eee;
          }

          @page{
            size:A4 landscape;
            margin:12mm;
          }

        </style>

      </head>

      <body>

        <h1>
          SeatScope Choice List
        </h1>

        <p>
          KCET / UGCET Counselling Choice Planner
        </p>

        ${buildChoiceTable()}

        <p>
          Historical counselling information only.
          Not an admission guarantee.
        </p>

        <script>

          window.onload=
            ()=>{
              setTimeout(
                ()=>{
                  window.print();
                },
                300
              );
            };

        <\/script>

      </body>

      </html>

    `);


    w.document.close();

  }
);


exportExcelBtn?.addEventListener(
  'click',
  ()=>{

    if(
      !getChoices().length
    ){

      return alert(
        'Your choice list is empty. Add some colleges first.'
      );

    }


    const blob=
      new Blob(
        [
          '\ufeff',

          `

          <html>

          <body>

            <h2>
              SeatScope Choice List
            </h2>

            ${buildChoiceTable()}

            <p>
              Historical counselling information only.
              Not an admission guarantee.
            </p>

          </body>

          </html>

          `
        ],
        {
          type:
            'application/vnd.ms-excel;charset=utf-8;'
        }
      );


    const url=
      URL.createObjectURL(
        blob
      );


    const a=
      document.createElement(
        'a'
      );


    a.href=url;

    a.download=
      'SeatScope_Choice_List.xls';


    document.body.appendChild(a);

    a.click();

    a.remove();


    setTimeout(
      ()=>{
        URL.revokeObjectURL(url);
      },
      1000
    );

  }
);


/* =========================================================
   BUTTONS
========================================================= */

findOptionsBtn?.addEventListener(
  'click',
  e=>{

    e.preventDefault();

    $('counselling')
      ?.scrollIntoView({
        behavior:'smooth'
      });

  }
);


learnMoreBtn?.addEventListener(
  'click',
  e=>{

    e.preventDefault();

    $('how-it-works')
      ?.scrollIntoView({
        behavior:'smooth'
      });

  }
);


/* =========================================================
   LOAD DATABASE
========================================================= */

/* Rebuilds the normal list of cutoff records from the packed file.
   Every record comes back exactly as it was before packing. */
function unpackDatabase(p){

  const MISSING='\u0000missing';

  const keys=p.keys;
  const tables=p.tables;
  const rows=p.rows;

  const out=new Array(rows.length);

  for(let i=0;i<rows.length;i++){

    const row=rows[i];
    const rec={};

    for(let c=0;c<keys.length;c++){

      const table=tables[c];
      let v=row[c];

      if(table){

        if(v===-1)continue;

        v=table[v];

      }
      else if(v===MISSING){

        continue;

      }

      rec[keys[c]]=v;

    }

    out[i]=rec;

  }

  return out;

}


/* CHANGE THIS TEXT whenever you replace data/cutoffs.json with a
   new version - it tells the browser to download the new file
   instead of using its saved copy. */
const DATA_VERSION='2026-10-18-v2';


async function loadDatabase(){

  try{

    /* try the packed file first, then the smaller copy, then the original */
    let response=null;

    for(const name of [
      'cutoffs.packed.json',
      'cutoffs.min.json',
      'cutoffs.json'
    ]){

      response=
        await fetch(
          `data/${name}?v=${DATA_VERSION}`,
          {
            cache:'force-cache'
          }
        );

      if(response.ok)break;

    }


    if(!response.ok){

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    let json=
      await response.json();


    if(
      json&&
      json.format==='seatscope-packed-1'
    ){

      json=unpackDatabase(json);

    }


    if(
      !Array.isArray(json)
    ){

      throw new Error(
        'cutoffs.json must contain an array'
      );

    }


    data=
      json.filter(
        r=>
          r&&
          typeof r==='object'
      );


    loaded=true;


    console.log(
      `SeatScope: ${data.length} cutoff records loaded.`
    );


    populateCourseGroups();

    updateBranches();
    updateCategories();
    updateSeats();
    updateRounds();

  }
  catch(error){

    console.error(
      'SeatScope database error:',
      error
    );


    alert(
      'SeatScope could not load the cutoff database. Make sure you are running the website using http://localhost:8000'
    );

  }

}


/* =========================================================
   INITIAL STATE
========================================================= */

if(resultsSection){

  resultsSection.hidden=true;

  resultsSection.style.display=
    'none';

}


renderChoices();

loadDatabase();

});


/* =========================================================
   HERO PARALLAX (visual only - does not touch data)
========================================================= */

(function(){

  const hero=document.querySelector('.hero');

  if(!hero)return;

  /* pause the hero animations while the hero is off screen */
  if('IntersectionObserver' in window){

    new IntersectionObserver(entries=>{

      hero.classList.toggle(
        'hero-offscreen',
        !entries[0].isIntersecting
      );

    }).observe(hero);

  }

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const layers=hero.querySelectorAll('.float-layer');

  let frame=null,mx=0,my=0;

  function apply(){

    frame=null;

    layers.forEach(l=>{

      const d=Number(l.dataset.depth)||10;

      l.style.transform=
        `translate3d(${-mx*d}px,${-my*d}px,0)`;

    });

  }

  hero.addEventListener('mousemove',e=>{

    const box=hero.getBoundingClientRect();

    mx=(e.clientX-box.left)/box.width-0.5;
    my=(e.clientY-box.top)/box.height-0.5;

    if(!frame)frame=requestAnimationFrame(apply);

  });

  hero.addEventListener('mouseleave',()=>{

    mx=0;
    my=0;

    if(!frame)frame=requestAnimationFrame(apply);

  });

})();


/* =========================================================
   DASHBOARD HELPERS (sidebar, active link, charts)
   Visual only - does not touch cutoff data or calculations
========================================================= */

(function(){

  /* ----- mobile sidebar ----- */

  const sidebar=document.getElementById('sidebar');
  const overlay=document.getElementById('sideOverlay');
  const toggle=document.getElementById('menuToggle');

  function closeMenu(){
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
  }

  toggle?.addEventListener('click',()=>{
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay?.addEventListener('click',closeMenu);

  sidebar?.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',closeMenu);
  });


  /* ----- highlight the sidebar link of the section on screen ----- */

  const links=[...document.querySelectorAll('.side-link[data-spy]')];

  const targets=links
    .map(l=>document.getElementById(l.dataset.spy))
    .filter(Boolean);

  function setActive(id){
    links.forEach(l=>{
      l.classList.toggle('active',l.dataset.spy===id);
    });
  }

  function spy(){

    let current=targets[0]?.id;

    const line=window.innerHeight*0.35;

    targets.forEach(t=>{
      if(t.hidden||t.offsetParent===null)return;
      if(t.getBoundingClientRect().top<=line){
        current=t.id;
      }
    });

    if(current)setActive(current);

  }

  let ticking=false;

  window.addEventListener('scroll',()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      spy();
      ticking=false;
    });
  },{passive:true});

  spy();


  /* ----- charts follow the four result counters ----- */

  const ids=['highCount','moderateCount','ambitiousCount','totalCount'];
  const els=ids.map(i=>document.getElementById(i));

  if(els.some(e=>!e))return;

  const toNum=e=>Number(String(e.textContent).replace(/[^0-9]/g,''))||0;

  function drawCharts(){

    const [h,m,a]=els.slice(0,3).map(toNum);

    const total=h+m+a;

    const max=Math.max(h,m,a,1);

    const set=(id,val,count)=>{
      const bar=document.getElementById(id);
      const lab=document.getElementById(id+'Val');
      if(bar)bar.style.height=Math.max(count?4:0,(count/max)*100)+'%';
      if(lab)lab.textContent=count.toLocaleString('en-IN');
    };

    set('barHigh',h,h);
    set('barModerate',m,m);
    set('barAmbitious',a,a);

    const pct=v=>total?Math.round((v/total)*100):0;

    const ph=pct(h);
    const pm=pct(m);
    const pa=total?Math.max(0,100-ph-pm):0;

    const donut=document.getElementById('chanceDonut');

    if(donut){
      donut.style.background=total
        ?`conic-gradient(#22c55e 0 ${ph}%, #f59e0b ${ph}% ${ph+pm}%, #8b5cf6 ${ph+pm}% 100%)`
        :'conic-gradient(#e2e8f0 0 100%)';
    }

    const t=document.getElementById('donutTotal');
    if(t)t.textContent=total.toLocaleString('en-IN');

    const lg=(id,v)=>{
      const e=document.getElementById(id);
      if(e)e.textContent=v+'%';
    };

    lg('legHigh',ph);
    lg('legModerate',pm);
    lg('legAmbitious',pa);

  }

  const watcher=new MutationObserver(drawCharts);

  els.forEach(e=>{
    watcher.observe(e,{childList:true,characterData:true,subtree:true});
  });

  drawCharts();

})();