import Navbar from "@/components/NavBar";

export default async function Dashboard({children}) {

 
  return (
<>
<Navbar />  
    <main className="container ">
        {children}
    </main>
 </>
  )};