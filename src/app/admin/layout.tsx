import Navbar from "@/components/NavBar";

export default async function Dashboard({ children }) {

  return (
    <>
      <Navbar />
     
      <main className="container mt-5 p-5 bg-white  ">
        {children}
      </main>
  
    </>
  )
};