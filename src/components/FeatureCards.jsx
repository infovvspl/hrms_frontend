import { Users, Clock, Wallet, Briefcase } from "lucide-react"

const features=[

{
icon:<Users size={32}/>,
title:"Employee Management",
desc:"Manage employee database, salary and documents."
},

{
icon:<Clock size={32}/>,
title:"Attendance Tracking",
desc:"Biometric, GPS and shift attendance."
},

{
icon:<Wallet size={32}/>,
title:"Payroll Automation",
desc:"Auto salary calculation with PF, ESI, TDS."
},

{
icon:<Briefcase size={32}/>,
title:"Recruitment System",
desc:"Job posting and interview scheduling."
}

]

export default function FeatureCards(){

return(

<section className="py-20 bg-white">

<div className="text-center mb-12">

<h2 className="text-4xl font-bold">
HRMS Features
</h2>

</div>

<div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">

{features.map((f,i)=>(

<div
key={i}
className="bg-lightbg p-6 rounded-xl shadow hover:shadow-xl transition"
>

<div className="text-primary mb-3">
{f.icon}
</div>

<h3 className="font-bold text-lg">
{f.title}
</h3>

<p className="text-gray-600">
{f.desc}
</p>

</div>

))}

</div>

</section>

)

}