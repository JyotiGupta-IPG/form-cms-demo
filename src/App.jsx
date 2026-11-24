import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Plus, Files, FileText, Layers, Settings, LogOut,
  Search, Bell, ChevronDown, Menu, X, Eye, Pencil, Copy, Trash2,
  Globe, Save, Upload, Smartphone, Monitor, GripVertical, Type,
  AlignLeft, Mail, Phone, Hash, List, CircleDot, CheckSquare, Calendar,
  Paperclip, User, EyeOff, Link as LinkIcon, ShieldCheck, Send, ArrowLeft,
  CheckCircle2, Filter, MoreHorizontal
} from "lucide-react";
import { createId, loadStore, saveStore } from "./services/storage.js";

const FIELD_TYPES = [
  { type:"text", label:"Single Line Text", icon:Type, placeholder:"Enter text" },
  { type:"textarea", label:"Multi-line Text Area", icon:AlignLeft, placeholder:"Enter details" },
  { type:"email", label:"Email", icon:Mail, placeholder:"name@example.com" },
  { type:"tel", label:"Mobile Number", icon:Phone, placeholder:"Enter mobile number" },
  { type:"number", label:"Number", icon:Hash, placeholder:"Enter number" },
  { type:"select", label:"Dropdown / Select", icon:List, placeholder:"Choose an option" },
  { type:"radio", label:"Radio Buttons", icon:CircleDot, placeholder:"Choose one" },
  { type:"checkboxes", label:"Checkboxes", icon:CheckSquare, placeholder:"Select options" },
  { type:"date", label:"Date Picker", icon:Calendar, placeholder:"Select date" },
  { type:"file", label:"File Upload", icon:Paperclip, placeholder:"Choose a file" },
  { type:"name", label:"Full Name", icon:User, placeholder:"Enter your full name" },
  { type:"hidden", label:"Hidden Field", icon:EyeOff, placeholder:"Hidden value" },
  { type:"url", label:"URL", icon:LinkIcon, placeholder:"https://example.com" },
  { type:"consent", label:"Consent Checkbox", icon:ShieldCheck, placeholder:"I agree to the privacy policy" },
  { type:"submit", label:"Submit Button", icon:Send, placeholder:"Submit" }
];

const sampleFields = () => [
  makeField("name", { label:"Full Name", required:true }),
  makeField("email", { label:"Email Address", required:true }),
  makeField("tel", { label:"Mobile Number", required:true }),
  makeField("select", { label:"Preferred Model", required:true, options:["BMW iX","BMW i5","BMW i7","BMW M5"] }),
  makeField("consent", { label:"Privacy Consent", required:true, consentText:"I agree to the processing of my personal data." }),
  makeField("submit", { label:"Submit", buttonText:"Submit Request" })
];

function makeField(type, overrides = {}) {
  const definition = FIELD_TYPES.find(item => item.type === type) || FIELD_TYPES[0];
  return {
    id:createId("field"), type, label:definition.label, placeholder:definition.placeholder,
    required:false, helpText:"", options:["Option 1","Option 2","Option 3"],
    consentText:"I agree to the privacy policy.", buttonText:"Submit",
    defaultValue:"", ...overrides
  };
}

const initialForms = [
  { id:"form-test-drive", name:"BMW Test Drive Form", campaign:"Test Drive Experience", status:"Published", updated:"2026-11-14", submissions:28, fields:sampleFields() },
  { id:"form-brochure", name:"BMW Brochure Request Form", campaign:"Model Brochure Campaign", status:"Draft", updated:"2026-11-12", submissions:12, fields:[makeField("name"),makeField("email"),makeField("select",{label:"Vehicle Model",options:["BMW iX","BMW i5","BMW i7"]}),makeField("submit")] },
  { id:"form-mini", name:"MINI Campaign Registration Form", campaign:"MINI Urban Drive", status:"Published", updated:"2026-11-10", submissions:46, fields:[makeField("name"),makeField("email"),makeField("tel"),makeField("consent"),makeField("submit")] }
];

const initialSubmissions = [
  { id:"S-1001", name:"Aarav Sharma", email:"aarav@example.com", mobile:"+91 98765 43210", model:"BMW iX", form:"BMW Test Drive Form", date:"18 Nov 2026", sync:"Demo – Not connected" },
  { id:"S-1002", name:"Maya Patel", email:"maya@example.com", mobile:"+91 99887 76655", model:"BMW i5", form:"BMW Test Drive Form", date:"17 Nov 2026", sync:"Demo – Not connected" },
  { id:"S-1003", name:"Rohan Mehta", email:"rohan@example.com", mobile:"+91 91234 56780", model:"MINI Cooper", form:"MINI Campaign Registration Form", date:"16 Nov 2026", sync:"Demo – Not connected" }
];

const templates = [
  { name:"Test Drive Registration", description:"Capture customer details and preferred vehicle.", fields:sampleFields() },
  { name:"Brochure Request", description:"Collect contact details and model preference.", fields:[makeField("name"),makeField("email"),makeField("select",{label:"Vehicle Model",options:["BMW iX","BMW i5","BMW i7","BMW M5"]}),makeField("consent"),makeField("submit")] },
  { name:"Contact Us", description:"A simple customer enquiry form.", fields:[makeField("name"),makeField("email"),makeField("textarea",{label:"Your Message",required:true}),makeField("consent"),makeField("submit")] },
  { name:"Campaign Registration", description:"Register customers for a campaign or event.", fields:[makeField("name"),makeField("email"),makeField("tel"),makeField("date",{label:"Preferred Date"}),makeField("consent"),makeField("submit")] },
  { name:"Service Enquiry", description:"Capture service-related requests.", fields:[makeField("name"),makeField("email"),makeField("tel"),makeField("select",{label:"Enquiry Type",options:["Service booking","Maintenance","Other"]}),makeField("textarea",{label:"Additional Details"}),makeField("submit")] }
];

function App() {
  const saved = loadStore();
  const [forms, setForms] = useState(saved?.forms || initialForms);
  const [submissions, setSubmissions] = useState(saved?.submissions || initialSubmissions);
  const [page, setPage] = useState("Dashboard");
  const [activeForm, setActiveForm] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { saveStore({ forms, submissions }); }, [forms, submissions]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const navigate = (next) => { setPage(next); setMobileNav(false); setActiveForm(null); };
  const openBuilder = (form = null) => {
    setActiveForm(form ? structuredClone(form) : {
      id:createId("form"), name:"Untitled Form", campaign:"", status:"Draft",
      updated:new Date().toISOString().slice(0,10), submissions:0, fields:[]
    });
    setPage("Builder");
  };
  const upsertForm = (form, status = form.status) => {
    const next = { ...form, status, updated:new Date().toISOString().slice(0,10) };
    setForms(current => current.some(item => item.id === next.id)
      ? current.map(item => item.id === next.id ? next : item)
      : [next, ...current]);
    setActiveForm(next);
    return next;
  };
  const deleteForm = (id) => {
    if (!window.confirm("Delete this form? This action cannot be undone.")) return;
    setForms(current => current.filter(form => form.id !== id));
    setToast("Form deleted");
  };
  const duplicateForm = (form) => {
    const copy = { ...structuredClone(form), id:createId("form"), name:`${form.name} (Copy)`, status:"Draft", updated:new Date().toISOString().slice(0,10), fields:form.fields.map(field => ({...field,id:createId("field")})) };
    setForms(current => [copy,...current]);
    setToast("Form duplicated");
  };

  const navItems = [
    ["Dashboard",LayoutDashboard],["Create Form",Plus],["All Forms",Files],
    ["Form Submissions",FileText],["Form Templates",Layers],["Settings",Settings]
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark">F</div><div><strong>FORM CMS</strong><small>MARKETING WORKSPACE</small></div><button className="icon-btn mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(([label,Icon])=><button key={label} className={`nav-item ${page===label || (label==="Create Form"&&page==="Builder") ? "active":""}`} onClick={()=>label==="Create Form"?openBuilder():navigate(label)}><Icon size={18}/><span>{label}</span>{label==="Form Submissions"&&<em>3</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><strong>Need a hand?</strong><p>This is a frontend demo workspace. Backend and CRM connections are not enabled.</p><span>DEMO ENVIRONMENT</span></div><button className="nav-item"><LogOut size={18}/><span>Logout</span></button></div>
    </aside>
    {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{page==="Builder"?"Form Builder":page}</strong></div><div className="top-actions"><label className="top-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search workspace"/></label><button className="icon-btn notification"><Bell size={18}/><i/></button><div className="profile"><div className="avatar">MA</div><div><strong>Marketing Admin</strong><small>Administrator</small></div><ChevronDown size={15}/></div></div></header>
      <div className="page-content">
        {page==="Dashboard"&&<Dashboard forms={forms} submissions={submissions} onCreate={()=>openBuilder()} onNavigate={navigate} onEdit={openBuilder}/>}
        {page==="Builder"&&activeForm&&<Builder form={activeForm} onChange={setActiveForm} onSave={()=>{upsertForm(activeForm);setToast("Draft saved successfully");}} onPublish={()=>{upsertForm(activeForm,"Published");setToast("Form published in demo mode");}} onPreview={()=>setPage("Preview")} onBack={()=>navigate("All Forms")} onToast={setToast}/>}
        {page==="Preview"&&activeForm&&<Preview form={activeForm} onBack={()=>setPage("Builder")} onSubmit={(data)=>{setSubmissions(current=>[{id:createId("S"),name:data.name||data["Full Name"]||"Demo Customer",email:data.email||"",mobile:data.tel||"",model:data.select||"",form:activeForm.name,date:new Date().toLocaleDateString("en-IN"),sync:"Demo – Not connected"},...current]);setForms(current=>current.map(f=>f.id===activeForm.id?{...f,submissions:(f.submissions||0)+1}:f));setToast("Demo submission captured");}}/>}
        {page==="All Forms"&&<AllForms forms={forms.filter(f=>`${f.name} ${f.campaign}`.toLowerCase().includes(search.toLowerCase()))} onCreate={()=>openBuilder()} onEdit={openBuilder} onDelete={deleteForm} onDuplicate={duplicateForm} onPreview={(f)=>{setActiveForm(structuredClone(f));setPage("Preview");}} onToggle={(f)=>{upsertForm(f,f.status==="Published"?"Draft":"Published");setToast("Form status updated");}}/>}
        {page==="Form Submissions"&&<Submissions submissions={submissions} search={search}/>}
        {page==="Form Templates"&&<Templates onUse={(template)=>openBuilder({id:createId("form"),name:template.name,campaign:"",status:"Draft",updated:new Date().toISOString().slice(0,10),submissions:0,fields:structuredClone(template.fields).map(f=>({...f,id:createId("field")}))})}/>}
        {page==="Settings"&&<SettingsPage/>}
      </div>
    </main>
    {toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </div>;
}

function PageHeading({eyebrow,title,description,action}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Dashboard({forms,submissions,onCreate,onNavigate,onEdit}) {
  const published=forms.filter(f=>f.status==="Published").length;
  const drafts=forms.filter(f=>f.status==="Draft").length;
  const total=forms.reduce((sum,f)=>sum+(f.submissions||0),0);
  return <><PageHeading eyebrow="OVERVIEW" title="Dashboard" description="Manage campaign forms and monitor customer engagement." action={<button className="btn btn-primary" onClick={onCreate}><Plus size={17}/> Create New Form</button>}/>
    <div className="stats-grid"><Stat icon={Files} label="Total Forms" value={forms.length} tone="blue"/><Stat icon={Globe} label="Published Forms" value={published} tone="green"/><Stat icon={Pencil} label="Draft Forms" value={drafts} tone="amber"/><Stat icon={FileText} label="Total Submissions" value={total} tone="violet"/></div>
    <div className="content-grid"><section className="panel"><div className="panel-heading"><div><h2>Recent Forms</h2><p>Your latest form activity</p></div><button className="text-btn" onClick={()=>onNavigate("All Forms")}>View all <ArrowLeft className="arrow-right" size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>FORM NAME</th><th>CAMPAIGN</th><th>STATUS</th><th>SUBMISSIONS</th><th></th></tr></thead><tbody>{forms.slice(0,5).map(f=><tr key={f.id}><td><button className="table-link" onClick={()=>onEdit(f)}>{f.name}</button><small className="cell-sub">{f.updated}</small></td><td>{f.campaign||"—"}</td><td><Status value={f.status}/></td><td>{f.submissions||0}</td><td><button className="icon-btn" onClick={()=>onEdit(f)}><Pencil size={16}/></button></td></tr>)}</tbody></table></div></section><section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent Submissions</h2><p>Latest customer responses</p></div><button className="text-btn" onClick={()=>onNavigate("Form Submissions")}>View all</button></div>{submissions.slice(0,4).map((s,i)=><div className="activity-row" key={s.id}><div className="activity-avatar">{s.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</div><div className="activity-info"><strong>{s.name}</strong><span>{s.form}</span></div><small>{i===0?"Today":`${i+1}d ago`}</small></div>)}</section></div>
  </>;
}
function Stat({icon:Icon,label,value,tone}) {return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong></div><div className="stat-trend">Demo</div></div>}
function Status({value}) {return <span className={`status ${value==="Published"?"published":"draft"}`}><i/>{value}</span>}

function AllForms({forms,onCreate,onEdit,onDelete,onDuplicate,onPreview,onToggle}) {
  return <><PageHeading eyebrow="FORM MANAGEMENT" title="All Forms" description="Create, edit and manage your campaign forms." action={<button className="btn btn-primary" onClick={onCreate}><Plus size={17}/> Create New Form</button>}/><section className="panel"><div className="panel-heading"><div><h2>Forms library</h2><p>{forms.length} forms in this view</p></div><div className="filter-label"><Filter size={15}/> All forms</div></div><div className="table-wrap"><table><thead><tr><th>FORM NAME</th><th>CAMPAIGN</th><th>LAST UPDATED</th><th>STATUS</th><th>SUBMISSIONS</th><th>ACTIONS</th></tr></thead><tbody>{forms.map(f=><tr key={f.id}><td><strong>{f.name}</strong><small className="cell-sub">{f.id}</small></td><td>{f.campaign||"—"}</td><td>{f.updated}</td><td><Status value={f.status}/></td><td>{f.submissions||0}</td><td><div className="action-group"><button title="Edit" onClick={()=>onEdit(f)}><Pencil size={15}/></button><button title="Preview" onClick={()=>onPreview(f)}><Eye size={15}/></button><button title="Duplicate" onClick={()=>onDuplicate(f)}><Copy size={15}/></button><button title={f.status==="Published"?"Unpublish":"Publish"} onClick={()=>onToggle(f)}><Globe size={15}/></button><button title="Delete" onClick={()=>onDelete(f.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{forms.length===0&&<div className="empty-state">No forms found. Create a new form to get started.</div>}</div></section></>;
}

function Builder({form,onChange,onSave,onPublish,onPreview,onBack,onToast}) {
  const [selectedId,setSelectedId]=useState(null);
  const [dragType,setDragType]=useState(null);
  const [dragIndex,setDragIndex]=useState(null);
  const selected=form.fields.find(f=>f.id===selectedId);
  const update=(patch)=>onChange({...form,...patch});
  const updateField=(id,patch)=>update({fields:form.fields.map(f=>f.id===id?{...f,...patch}:f)});
  const addField=(type,index=form.fields.length)=>{
    const field=makeField(type);
    const fields=[...form.fields]; fields.splice(index,0,field);
    update({fields});setSelectedId(field.id);
  };
  const removeField=(id)=>{update({fields:form.fields.filter(f=>f.id!==id)});if(selectedId===id)setSelectedId(null);};
  const duplicateField=(field)=>{const copy={...field,id:createId("field"),label:`${field.label} (Copy)`};const index=form.fields.findIndex(f=>f.id===field.id);const fields=[...form.fields];fields.splice(index+1,0,copy);update({fields});setSelectedId(copy.id);};
  const moveField=(from,to)=>{if(from===null||to===null||from===to)return;const fields=[...form.fields];const [item]=fields.splice(from,1);fields.splice(to,0,item);update({fields});};
  const onDropCanvas=(e)=>{e.preventDefault();if(dragType){addField(dragType);setDragType(null);}else if(dragIndex!==null){moveField(dragIndex,form.fields.length);setDragIndex(null);}};
  const fieldIcon=(type)=>{const def=FIELD_TYPES.find(f=>f.type===type);return def?def.icon:Type;};
  return <div className="builder-page"><div className="builder-top"><div><button className="back-link" onClick={onBack}><ArrowLeft size={16}/> Back to forms</button><div className="builder-title"><input value={form.name} onChange={e=>update({name:e.target.value})} aria-label="Form name"/><Status value={form.status}/></div><p>Build your form using predefined fields. Drag fields onto the canvas to get started.</p></div><div className="builder-actions"><button className="btn btn-secondary" onClick={onSave}><Save size={16}/> Save Draft</button><button className="btn btn-secondary" onClick={onPreview}><Eye size={16}/> Preview</button><button className="btn btn-primary" onClick={onPublish}><Upload size={16}/> Publish</button></div></div>
    <div className="builder-meta"><label>Campaign name <input value={form.campaign||""} onChange={e=>update({campaign:e.target.value})} placeholder="e.g. BMW Electric Drive Campaign"/></label><span><ShieldCheck size={15}/> Predefined fields only</span></div>
    <div className="builder-workspace">
      <aside className="builder-panel field-library"><div className="builder-panel-title"><div><h3>Field Library</h3><p>Drag a field to your form</p></div><span className="count-pill">{FIELD_TYPES.length}</span></div><div className="field-list">{FIELD_TYPES.map(item=><div key={item.type} className="field-tile" draggable onDragStart={e=>{setDragType(item.type);setDragIndex(null);e.dataTransfer.effectAllowed="copy";}} onDragEnd={()=>setDragType(null)}><span className="field-tile-icon"><item.icon size={17}/></span><span>{item.label}</span><GripVertical size={15} className="grip"/></div>)}</div><div className="library-note"><ShieldCheck size={16}/><span>Field types are managed centrally. Custom field creation is disabled.</span></div></aside>
      <section className="canvas-column"><div className="canvas-toolbar"><div><strong>Form Canvas</strong><span>{form.fields.length} fields</span></div><button className="text-btn" onClick={()=>{if(window.confirm("Remove all fields from this form?")){update({fields:[]});setSelectedId(null);}}}><Trash2 size={14}/> Clear canvas</button></div><div className="form-canvas" onDragOver={e=>e.preventDefault()} onDrop={onDropCanvas}>
        <div className="canvas-form-head"><div className="mini-brand">BMW</div><h2>{form.name||"Untitled Form"}</h2><p>Complete the form below and our team will get in touch.</p></div>
        {form.fields.length===0?<div className="canvas-empty"><div className="empty-icon"><Plus size={24}/></div><strong>Drag and drop fields here</strong><span>Select a predefined field from the Field Library to build your form.</span></div>:<div className="canvas-fields">{form.fields.map((field,index)=><div key={field.id} className={`canvas-field ${selectedId===field.id?"selected":""}`} onClick={()=>setSelectedId(field.id)} draggable onDragStart={e=>{setDragIndex(index);setDragType(null);e.dataTransfer.effectAllowed="move";}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation();e.preventDefault();if(dragIndex!==null){moveField(dragIndex,index);setDragIndex(null);}else if(dragType){addField(dragType,index);setDragType(null);}}}><div className="canvas-field-top"><span className="field-order">{String(index+1).padStart(2,"0")}</span><span className="field-kind">{field.label}</span><div className="field-tools"><button title="Duplicate" onClick={e=>{e.stopPropagation();duplicateField(field);}}><Copy size={14}/></button><button title="Delete" onClick={e=>{e.stopPropagation();removeField(field.id);}}><Trash2 size={14}/></button><GripVertical size={15}/></div></div><FieldPreview field={field} disabled/><div className="field-caption">{field.required?"Required":"Optional"} {field.helpText&&`· ${field.helpText}`}</div></div>)}</div>}
        <div className="canvas-drop-hint"><Plus size={14}/> Drop another field here</div>
      </div><div className="canvas-footer"><span><ShieldCheck size={14}/> Secure form experience · Demo only</span><span>Autosave is not enabled – use Save Draft</span></div></section>
      <aside className="builder-panel properties-panel"><div className="builder-panel-title"><div><h3>Field Settings</h3><p>{selected?"Configure selected field":"Select a field to edit"}</p></div></div>{selected?<FieldSettings field={selected} onChange={patch=>updateField(selected.id,patch)}/>:<div className="settings-empty"><div className="settings-empty-icon"><Pencil size={20}/></div><strong>No field selected</strong><span>Choose a field on the canvas to edit its label, placeholder, validation and options.</span></div>}<div className="properties-footer"><span>FORM CMS DEMO</span><small>Version 1.0</small></div></aside>
    </div>
  </div>;
}

function FieldPreview({field,disabled=false}) {
  const common={placeholder:field.placeholder||"",disabled};
  if(field.type==="submit")return <button className="preview-submit" disabled>{field.buttonText||"Submit"}</button>;
  if(field.type==="consent")return <label className="preview-consent"><input type="checkbox" disabled/> {field.consentText||field.label}</label>;
  if(field.type==="radio"||field.type==="checkboxes")return <div className="preview-options">{(field.options||[]).map((o,i)=><label key={i}><input type={field.type==="radio"?"radio":"checkbox"} disabled/> {o}</label>)}</div>;
  if(field.type==="select")return <select disabled defaultValue=""><option value="">{field.placeholder||"Select an option"}</option>{(field.options||[]).map((o,i)=><option key={i}>{o}</option>)}</select>;
  if(field.type==="textarea")return <textarea {...common} rows="3"/>;
  if(field.type==="file")return <input type="file" disabled/>;
  if(field.type==="hidden")return <div className="hidden-field-preview"><EyeOff size={14}/> Hidden field – not visible to visitors</div>;
  return <input type={field.type==="name"?"text":field.type} {...common} value={field.defaultValue||""} readOnly/>;
}

function FieldSettings({field,onChange}) {
  const isChoice=["select","radio","checkboxes"].includes(field.type);
  return <div className="settings-form"><div className="setting-type"><span className="field-tile-icon">{React.createElement(FIELD_TYPES.find(f=>f.type===field.type)?.icon||Type,{size:17})}</span><div><strong>{FIELD_TYPES.find(f=>f.type===field.type)?.label}</strong><small>Predefined field</small></div></div>
    {field.type!=="submit"&&field.type!=="hidden"&&<Setting label="Field Label"><input value={field.label} onChange={e=>onChange({label:e.target.value})}/></Setting>}
    {!["submit","consent","hidden","file","date","checkboxes","radio"].includes(field.type)&&<Setting label="Placeholder"><input value={field.placeholder||""} onChange={e=>onChange({placeholder:e.target.value})}/></Setting>}
    {isChoice&&<Setting label="Placeholder"><input value={field.placeholder||""} onChange={e=>onChange({placeholder:e.target.value})}/></Setting>}
    {isChoice&&<Setting label="Options"><textarea rows="5" value={(field.options||[]).join("\n")} onChange={e=>onChange({options:e.target.value.split("\n").filter(x=>x.trim())})}/><small className="field-hint">Enter one option per line.</small></Setting>}
    {field.type==="consent"&&<Setting label="Consent Statement"><textarea rows="4" value={field.consentText||""} onChange={e=>onChange({consentText:e.target.value})}/></Setting>}
    {field.type==="submit"&&<Setting label="Button Text"><input value={field.buttonText||""} onChange={e=>onChange({buttonText:e.target.value})}/></Setting>}
    {field.type==="hidden"&&<Setting label="Hidden Value"><input value={field.defaultValue||""} onChange={e=>onChange({defaultValue:e.target.value})}/></Setting>}
    {!["submit","hidden"].includes(field.type)&&<Setting label="Help Text"><input value={field.helpText||""} onChange={e=>onChange({helpText:e.target.value})}/></Setting>}
    {!["submit","hidden"].includes(field.type)&&<label className="required-toggle"><span><strong>Required field</strong><small>Visitors must complete this field.</small></span><input type="checkbox" checked={!!field.required} onChange={e=>onChange({required:e.target.checked})}/></label>}
  </div>;
}
function Setting({label,children}) {return <label className="setting"><span>{label}</span>{children}</label>}

function Preview({form,onBack,onSubmit}) {
  const [device,setDevice]=useState("desktop");
  const [success,setSuccess]=useState(false);
  const [values,setValues]=useState({});
  const [errors,setErrors]=useState({});
  const visibleFields=form.fields.filter(f=>f.type!=="hidden"&&f.type!=="submit");
  const set=(id,value)=>setValues(v=>({...v,[id]:value}));
  const submit=(e)=>{e.preventDefault();const next={};visibleFields.forEach(f=>{const value=values[f.id];if(f.required&&(value===undefined||value===""||value===false||(Array.isArray(value)&&!value.length)))next[f.id]="This field is required.";if(f.type==="email"&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))next[f.id]="Enter a valid email address.";});setErrors(next);if(Object.keys(next).length===0){const data={};visibleFields.forEach(f=>{data[f.type==="name"?"name":f.type]=values[f.id]??"";});onSubmit(data);setSuccess(true);}};
  return <div className="preview-page"><div className="preview-top"><div><button className="back-link" onClick={onBack}><ArrowLeft size={16}/> Back to builder</button><h1>Form Preview</h1><p>See how your form will appear to website visitors.</p></div><div className="device-switch"><button className={device==="desktop"?"active":""} onClick={()=>setDevice("desktop")}><Monitor size={16}/> Desktop</button><button className={device==="mobile"?"active":""} onClick={()=>setDevice("mobile")}><Smartphone size={16}/> Mobile</button></div></div><div className="preview-stage"><div className={`visitor-form ${device==="mobile"?"mobile-preview":""}`}><div className="visitor-brand">BMW</div>{success?<div className="success-state"><div><CheckCircle2 size={34}/></div><h2>Thank you!</h2><p>Your demo submission has been received successfully.</p><button className="btn btn-secondary" onClick={()=>{setSuccess(false);setValues({});setErrors({});}}>Submit another response</button></div>:<><div className="visitor-heading"><h2>{form.name||"Untitled Form"}</h2><p>Complete the details below and our team will be in touch.</p></div><form onSubmit={submit} noValidate>{visibleFields.map(f=><PreviewInput key={f.id} field={f} value={values[f.id]} error={errors[f.id]} onChange={v=>set(f.id,v)}/>)}<button className="visitor-submit" type="submit">{form.fields.find(f=>f.type==="submit")?.buttonText||"Submit"}</button><p className="privacy-note"><ShieldCheck size={13}/> Your information is used for this demo only.</p></form></>}</div></div></div>;
}
function PreviewInput({field,value,error,onChange}) {
  const common={value:value??"",onChange:e=>onChange(e.target.value),required:field.required};
  return <div className="visitor-field"><label>{field.label}{field.required&&<b> *</b>}</label>{field.type==="textarea"?<textarea {...common} placeholder={field.placeholder}/>:field.type==="select"?<select {...common}><option value="">{field.placeholder||"Select an option"}</option>{(field.options||[]).map((o,i)=><option key={i} value={o}>{o}</option>)}</select>:field.type==="radio"||field.type==="checkboxes"?<div className="visitor-choice">{(field.options||[]).map((o,i)=><label key={i}><input type={field.type==="radio"?"radio":"checkbox"} name={field.id} checked={field.type==="radio"?value===o:(value||[]).includes(o)} onChange={e=>field.type==="radio"?onChange(o):onChange(e.target.checked?[...(value||[]),o]:(value||[]).filter(x=>x!==o))}/>{o}</label>)}</div>:field.type==="consent"?<label className="visitor-consent"><input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)}/>{field.consentText||field.label}</label>:field.type==="file"?<input type="file" onChange={e=>onChange(e.target.files?.[0]?.name||"")}/>:<input type={field.type==="name"?"text":field.type} {...common} placeholder={field.placeholder}/ >}{field.helpText&&<small>{field.helpText}</small>}{error&&<em className="error-text">{error}</em>}</div>;
}

function Templates({onUse}) {
  return <><PageHeading eyebrow="REUSABLE STARTERS" title="Form Templates" description="Start faster with predefined campaign form structures."/><div className="template-grid">{templates.map((t,i)=><div className="template-card" key={t.name}><div className={`template-visual visual-${i}`}><div className="template-paper"><span/><span/><span/><span/></div><div className="template-badge">{["TEST DRIVE","BROCHURE","CONTACT","CAMPAIGN","SERVICE"][i]}</div></div><div className="template-body"><h3>{t.name}</h3><p>{t.description}</p><div className="template-meta"><span>{t.fields.length} predefined fields</span><button className="btn btn-secondary btn-small" onClick={()=>onUse(t)}>Use template <ArrowLeft className="arrow-right" size={14}/></button></div></div></div>)}</div></>;
}
function Submissions({submissions,search}) {
  const [formFilter,setFormFilter]=useState("All forms");
  const [selected,setSelected]=useState(null);
  const forms=[...new Set(submissions.map(s=>s.form))];
  const filtered=submissions.filter(s=>(formFilter==="All forms"||s.form===formFilter)&&`${s.name} ${s.email} ${s.model}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageHeading eyebrow="CUSTOMER RESPONSES" title="Form Submissions" description="Review customer responses captured through your forms."/><section className="panel"><div className="panel-heading"><div><h2>All submissions</h2><p>{filtered.length} responses found · sample data</p></div><select className="filter-select" value={formFilter} onChange={e=>setFormFilter(e.target.value)}><option>All forms</option>{forms.map(f=><option key={f}>{f}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>CONTACT</th><th>VEHICLE</th><th>FORM</th><th>SUBMITTED</th><th>CRM STATUS</th><th></th></tr></thead><tbody>{filtered.map(s=><tr key={s.id}><td><strong>{s.name}</strong><small className="cell-sub">{s.id}</small></td><td>{s.email}<small className="cell-sub">{s.mobile}</small></td><td>{s.model||"—"}</td><td>{s.form}</td><td>{s.date}</td><td><span className="sync-status">{s.sync}</span></td><td><button className="icon-btn" onClick={()=>setSelected(s)} title="View details"><Eye size={16}/></button></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state">No submissions match your filters.</div>}</div></section>{selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="detail-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">SUBMISSION DETAILS</span><h2>{selected.name}</h2></div><button className="icon-btn" onClick={()=>setSelected(null)}><X/></button></div>{Object.entries(selected).filter(([k])=>k!=="id").map(([k,v])=><div className="detail-row" key={k}><span>{k.replace(/[A-Z]/g,m=>" "+m).toUpperCase()}</span><strong>{String(v)}</strong></div>)}</div></div>}</>;
}
function SettingsPage() {return <><PageHeading eyebrow="WORKSPACE CONFIGURATION" title="Settings" description="Manage your demo workspace preferences and profile."/><div className="settings-layout"><section className="panel settings-section"><h2>Profile</h2><p>Current user details for this demo workspace.</p><div className="profile-large"><div className="avatar large">MA</div><div><strong>Marketing Admin</strong><span>marketing.admin@example.com</span></div></div><div className="settings-info"><span>ROLE</span><strong>Administrator</strong></div><div className="settings-info"><span>ENVIRONMENT</span><strong>Frontend demo · Local browser storage</strong></div></section><section className="panel settings-section"><h2>Application settings</h2><p>Demo configuration and future integration readiness.</p><div className="integration-row"><div><strong>PostgreSQL</strong><span>Database connection</span></div><Status value="Draft"/><small>Not connected</small></div><div className="integration-row"><div><strong>Salesforce CRM</strong><span>Lead synchronisation</span></div><Status value="Draft"/><small>Not connected</small></div><div className="integration-row"><div><strong>External APIs</strong><span>Third-party services</span></div><Status value="Draft"/><small>Not connected</small></div><div className="demo-notice"><ShieldCheck size={17}/> These are informational placeholders. No credentials or external services are configured.</div></section></div></>;}

export default App;