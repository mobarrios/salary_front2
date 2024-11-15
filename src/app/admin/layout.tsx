import Breadcrumb from "@/components/BreadCrumb";
import FooterComp from "@/components/Footer";
import Navbar from "@/components/NavBar";

export default async function Dashboard({ children }) {

  const bc = [];

  return (
    <>
      <Navbar/>
     
      <main className="container mt-5 bg-white  ">     
      {children}
      </main>

      {/* <FooterComp/> */}
    </>
  )
};