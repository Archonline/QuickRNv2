import {test,expect} from "@playwright/test";

const expectedFormats=["single-response","multiple-response","select-n","drop-down-cloze","drop-down-rationale","highlight-text","matrix-multiple","matrix-single","numeric-entry","ordered-response","bow-tie","drag-drop","trend","graphics-based"];

test.beforeEach(async({page})=>{
 await page.goto("/tests/e2e/question-rendering-harness.html");
});

test("starts and renders a real published item for every supported NCLEX format",async({page})=>{
 await page.getByRole("button",{name:/14-format NGN sampler/}).click();
 const begin=page.getByRole("button",{name:/Begin examination/});
 await expect(begin).toBeEnabled();
 await begin.click();

 const seen=new Set<string>();
 for(let i=0;i<expectedFormats.length;i++){
  const stem=page.locator(".exam-stem");
  await expect(stem).toBeVisible();
  await expect(stem).not.toBeEmpty();
  await expect(page.locator(".exam-inline-scenario, .exam-left-scenario, .exam-record-panel").first()).toBeVisible();
  const recordContent=page.locator(".exam-record-panel .exam-record-content p");
  if(await recordContent.count()) await expect(recordContent).not.toBeEmpty();
  const rawType=(await page.locator(".exam-type-pill").innerText()).trim().toLowerCase().replace(/\s+/g,"-");
  seen.add(rawType);

  if(rawType==="single-response"||rawType==="multiple-response"||rawType==="select-n"||rawType==="trend"){
   await expect(page.locator(".exam-options input").first()).toBeVisible();
  }else if(rawType==="drop-down-cloze"||rawType==="drop-down-rationale"){
   await expect(page.locator(".ngn-dropdown select").first()).toBeVisible();
  }else if(rawType==="highlight-text"){
   await expect(page.locator(".ngn-highlight-passage, .ngn-matrix").first()).toBeVisible();
  }else if(rawType==="matrix-multiple"||rawType==="matrix-grid"){
   await expect(page.locator(".ngn-matrix input[type=checkbox]").first()).toBeVisible();
  }else if(rawType==="matrix-single"){
   await expect(page.locator(".ngn-matrix input[type=radio]").first()).toBeVisible();
  }else if(rawType==="numeric-entry"){
   await expect(page.locator(".ngn-numeric input")).toBeVisible();
  }else if(rawType==="ordered-response"){
   await expect(page.locator(".ngn-order-row").first()).toBeVisible();
  }else if(rawType==="bow-tie"){
   await expect(page.locator(".ngn-bowtie-tile").first()).toBeVisible();
  }else if(rawType==="drag-drop"){
   await expect(page.locator(".ngn-dragdrop-bank button").first()).toBeVisible();
  }else if(rawType==="graphics-based"){
   await expect(page.locator(".ngn-graphic").first()).toBeVisible();
   await expect(page.locator(".ngn-graphic-figure img, .ngn-graphic-figure svg").first()).toBeVisible();
  }

  if(i<expectedFormats.length-1) await page.getByRole("button",{name:/Next/}).click();
 }
 console.log("Rendered published formats:",[...seen]);
 for(const format of expectedFormats){
  expect(seen.has(format)||format==="matrix-multiple"&&seen.has("matrix-grid"),"missing rendered format: "+format+"; rendered: "+[...seen].join(", ")).toBeTruthy();
 }
});

test("all published formats fit a mobile viewport without clipping the question card",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.getByRole("button",{name:/14-format NGN sampler/}).click();
 await page.getByRole("button",{name:/Begin examination/}).click();
 for(let i=0;i<expectedFormats.length;i++){
  await expect(page.locator(".exam-question-card")).toBeVisible();
  await expect(page.locator(".exam-stem")).not.toBeEmpty();
  await expect(page.locator(".exam-inline-scenario, .exam-left-scenario, .exam-record-panel").first()).toBeVisible();
  const dimensions=await page.evaluate(()=>{
   const card=document.querySelector(".exam-question-card") as HTMLElement;
   const rect=card.getBoundingClientRect();
   return {left:rect.left,right:rect.right,viewport:document.documentElement.clientWidth};
  });
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport+1);
  if(i<expectedFormats.length-1) await page.getByRole("button",{name:/Next/}).click();
 }
});
