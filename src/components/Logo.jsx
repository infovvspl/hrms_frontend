import { motion } from "framer-motion"
import logo from "../assets/Logo.png"

export default function Logo() {

return (

<motion.div

initial={{ opacity:0, x:-40 }}
animate={{ opacity:1, x:0 }}
transition={{ duration:0.7 }}

whileHover={{ scale:1.08 }}

className="flex items-center cursor-pointer"
>
<motion.img
src={logo}
alt="Zenova HR"
className="h-12 md:h-14 w-auto object-contain"
animate={{ y:[0,-4,0] }}
transition={{
duration:3,
repeat:Infinity,
ease:"easeInOut"
}}
/>
</motion.div>

)
}