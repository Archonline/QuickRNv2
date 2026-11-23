const SET_SCORED = new Set(["multiple-response","extended-multiple-response","select-n","highlight-text","highlight-table","matrix-multiple","matrix-grid","bow-tie","graphics-based"]);
const ORDER_SCORED = new Set(["ordered-response","extended-drag-drop"]);
const clamp = n => Math.max(0, Math.min(1, n));
const setCredit = (actual, expected) => {
 const key=new Set(expected.map(String)), got=new Set(actual.filter(v=>v!=="").map(String));
 const right=[...got].filter(v=>key.has(v)).length, wrong=[...got].filter(v=>!key.has(v)).length;
 return clamp((right-wrong)/Math.max(1,key.size));
};
const exactSequence=(actual,expected)=>actual.length===expected.length&&actual.every((v,i)=>String(v)===String(expected[i]))?1:0;
function matrixCredit(type,actual,expected){
 const keys=new Set(expected.map(String)), rows=new Set([...expected,...actual].map(v=>String(v).split(":")[0]));
 if(!rows.size)return 0;let earned=0;
 for(const row of rows){const k=[...keys].filter(v=>v.startsWith(row+":")),a=actual.filter(v=>String(v).startsWith(row+":"));
  earned+=type==="matrix-single"?(k.length===1&&a.length===1&&k[0]===String(a[0])?1:0):setCredit(a,k);
 }return earned/rows.size;
}
function bowTieCredit(actual,expected){
 return ["c","a","m"].map(prefix=>setCredit(actual.filter(v=>String(v).startsWith(prefix)),expected.filter(v=>String(v).startsWith(prefix)))).reduce((a,b)=>a+b,0)/3;
}
export function responseScore(type,actual,expected,tolerance=0){
 if(!Array.isArray(actual)||!Array.isArray(expected)||!expected.length)return 0;
 if(type==="numeric-entry"){if(actual.length!==1||expected.length!==1)return 0;const a=Number(actual[0]),b=Number(expected[0]);return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance?1:0;}
 if(ORDER_SCORED.has(type))return exactSequence(actual,expected);
 if(["matrix-single","matrix-multiple","matrix-grid"].includes(type)){if(type==="matrix-grid"&&[...actual,...expected].some(v=>!/^\\d+:\\d+$/.test(String(v))))return setCredit(actual,expected);return matrixCredit(type,actual,expected);}
 if(type==="bow-tie")return bowTieCredit(actual,expected);
 if(type==="drop-down-table"){if([...actual,...expected].some(v=>/^\\d+:\\d+$/.test(String(v)))){const rows=new Set([...actual,...expected].map(v=>String(v).split(":")[0]));if(!rows.size)return 0;let earned=0;for(const row of rows){const a=actual.filter(v=>String(v).startsWith(row+":")),k=expected.filter(v=>String(v).startsWith(row+":"));earned+=a.length===1&&k.length===1&&String(a[0])===String(k[0])?1:0;}return earned/rows.size;}const n=Math.max(actual.length,expected.length);let earned=0;for(let i=0;i<n;i++)if(actual[i]!==undefined&&actual[i]!==""&&String(actual[i])===String(expected[i]))earned++;return n?earned/n:0;}
 if(["drop-down-cloze","drop-down-rationale","drag-drop"].includes(type)){const n=Math.max(actual.length,expected.length);let earned=0;for(let i=0;i<n;i++)if(actual[i]!==undefined&&actual[i]!==""&&String(actual[i])===String(expected[i]))earned++;return n?earned/n:0;}
 if(SET_SCORED.has(type))return setCredit(actual,expected);
 return exactSequence(actual,expected);
}
export function responseIsCorrect(type,actual,expected,tolerance=0){return responseScore(type,actual,expected,tolerance)===1;}
/** Provisional Rasch-style estimate for practice only; not NCSBN CAT scoring. */
export function estimateCatAbility(responses){
 if(!Array.isArray(responses)||!responses.length)return 0;const difficulty=v=>v==="Foundational"?-1:v==="Advanced"?1:0;let theta=0;
 for(let i=0;i<12;i++){let residual=0,information=0;for(const r of responses){const earned=clamp(Number(r.earned)||0),p=1/(1+Math.exp(-(theta-difficulty(r.difficulty))));residual+=earned-p;information+=p*(1-p);}if(information<1e-8)break;theta=Math.max(-4,Math.min(4,theta+Math.max(-.5,Math.min(.5,residual/information))));}
 return Number(theta.toFixed(3));
}