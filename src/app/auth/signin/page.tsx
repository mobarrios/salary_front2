"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";
import { error } from "console";
import Head from 'next/head';
import { useEffect } from 'react';

type LoginInput = {
  username: string;
  password: string;
}

type PageProps = {
  searchParams: { error?: string }
}


export default function SignIn({ searchParams }: PageProps) {
  
  const [inputs, setInputs] = useState<LoginInput>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const [randomImage, setRandomImage] = useState('/login_img/1.jpg');

  // Cambia la imagen aleatoriamente al cargar el componente
  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 6) + 1; // Genera un número aleatorio entre 1 y 6
    setRandomImage(`/login_img/${randomNumber}.jpg`); // Cambia la ruta según tu estructura
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({ ...values, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn('credentials', {
        username: inputs.username,
        password: inputs.password,
        callbackUrl: '/admin/home'
      });
    } catch (error) {
      // Manejar el error aquí
      console.error('front:', error);
      // Puedes guardar el error en un estado para mostrarlo en la interfaz de usuario
      //setError('Error al autenticar. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  }

  return (
 <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="row bg-white rounded shadow overflow-hidden" style={{ maxWidth: '900px', width: '100%' }}>
        {/* Columna del formulario */}
        <div className="col-12 col-md-6 p-5 d-flex align-items-center">
          <div style={{ width: '100%' }}>
            <div className="mb-5 text-center">
              <img
                src="/equipay.png"
                width="240"
                height="60"
                alt="Logo"
              />
            </div>  
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  placeholder="name@example.com"
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  required
                  value={inputs.username || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  placeholder="Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  required
                  value={inputs.password || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mt-4 d-grid gap-2">
                <input
                  type="submit"
                  value={loading ? 'Loading...' : 'Sign In'}
                  className="btn btn-primary"
                  disabled={loading}
                />
                {searchParams.error && (
                  <div className="mb-1">
                    <p className="text-center capitalize">
                      {searchParams.error}
                    </p>
                  </div>
                )}
              </div>
              <div className="row">
                <div className="col-8">
                  <div className="text-end mt-2">
                    <a href="#">Forgot password?</a>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-end mt-2">
                  v 230625
                  </div>
                </div>
              </div>
            </form>
            <div className="container mt-5 text-center">
              <div>or continue with</div>
              <div>
                <button className="m-2 btn btn-danger btn-md"><i className="bi bi-google"></i></button>
                <button className="m-2 btn btn-success btn-md" onClick={() => signIn("azure-ad")}><i className="bi bi-microsoft"></i></button>
                {/* <button className="m-2 btn btn-success btn-md"  onClick={() => signIn("azure-ad")}>Login Azure</button> */}

              </div>
            </div>
            {searchParams.error && (
              <div>
                <p className="text-red text-center capitalize">
                  Invalid credentials.
                </p>
              </div>
            )}       
          </div>
        </div>

        {/* Columna de la imagen */}
        <div className="col-12 col-md-6 p-0">
          <img
            src={randomImage}
            alt="Imagen de login"
            className="img-fluid w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>

    // <div className="flex items-center justify-center h-screen">
    //   <div className="w-full max-w-md">
    //     <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    //       <div className="p-4 sm:p-12.5 xl:p-17.5">
    //         <span className="mb-1.5 block font-medium">Start for free</span>
    //         <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
    //           Sign In to TailAdmin
    //         </h2>
    //           <form className="space-y-6" onSubmit={handleSubmit}>
    //             <div className="mb-4">
    //               <label className="mb-2.5 block font-medium text-black dark:text-white">
    //                 Email
    //               </label>
    //               <div className="relative">
    //                 <input
    //                   id="username"
    //                   name="username"
    //                   type="text"
    //                   autoComplete="off"
    //                   required
    //                   value={inputs.username || ""}
    //                   onChange={handleChange}
    //                   className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    //                 />


    //                 <span className="absolute right-4 top-4">
    //                   <svg
    //                     className="fill-current"
    //                     width="22"
    //                     height="22"
    //                     viewBox="0 0 22 22"
    //                     fill="none"
    //                     xmlns="http://www.w3.org/2000/svg"
    //                   >
    //                     <g opacity="0.5">
    //                       <path
    //                         d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
    //                         fill=""
    //                       />
    //                     </g>
    //                   </svg>
    //                 </span>
    //               </div>
    //             </div>

    //             <div className="mb-6">
    //               <label className="mb-2.5 block font-medium text-black dark:text-white">
    //                 Re-type Password
    //               </label>
    //               <div className="relative">
    //                 <input
    //                   id="password"
    //                   name="password"
    //                   type="password"
    //                   autoComplete="off"
    //                   required
    //                   value={inputs.password || ""}
    //                   onChange={handleChange}
    //                   className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    //                 />

    //                 <span className="absolute right-4 top-4">
    //                   <svg
    //                     className="fill-current"
    //                     width="22"
    //                     height="22"
    //                     viewBox="0 0 22 22"
    //                     fill="none"
    //                     xmlns="http://www.w3.org/2000/svg"
    //                   >
    //                     <g opacity="0.5">
    //                       <path
    //                         d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
    //                         fill=""
    //                       />
    //                       <path
    //                         d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
    //                         fill=""
    //                       />
    //                     </g>
    //                   </svg>
    //                 </span>
    //               </div>
    //             </div>

    //             <div className="mb-5">
    //               <input
    //                 type="submit"
    //                 value="Sign In"
    //                 className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
    //               />
    //             </div>

    //           </form>
    //           {searchParams.error && (
    //             <div className="mb-5">
    //               <p className="text-red text-center capitalize">
    //                 Credenciales inválidas
    //               </p>
    //             </div>
    //           )}       
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};


