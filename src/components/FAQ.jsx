import { useState } from "react"

export default function FAQ(){

const [open,setOpen]=useState(null)

const faqs=[

{
q:"What is HRMS?",
a:"HRMS is software used to manage employee records, payroll, attendance and HR processes in a centralized system."
},

{
q:"Is HRMS useful for small companies?",
a:"Yes. HRMS helps startups and small businesses automate HR tasks like attendance tracking, payroll processing, and employee data management."
},

{
q:"Does HRMS support Indian payroll?",
a:"Yes. Zenova HR supports Indian payroll compliance including PF, ESI, professional tax, and TDS calculations."
},

{
q:"Can employees apply for leave through Zenova HR?",
a:"Yes. Employees can apply for leave online, managers can approve or reject requests, and the system automatically tracks leave balances."
},

{
q:"Does Zenova HR support biometric or mobile attendance?",
a:"Yes. Zenova HR supports biometric devices, mobile attendance, GPS-based tracking, and face authentication for secure attendance marking. It also includes shift scheduling and overtime management."
}

]

return(

<section className="py-20 bg-lightbg">

<div className="max-w-4xl mx-auto">

<h2 className="text-4xl font-bold text-center mb-10">
FAQs
</h2>

{faqs.map((f,i)=>(

<div key={i} className="border-b py-4">

<button
className="w-full text-left font-semibold"
onClick={()=>setOpen(open===i?null:i)}
>

{f.q}

</button>

{open===i && (

<p className="text-gray-600 mt-2">
{f.a}
</p>

)}

</div>

))}

</div>

</section>

)

}