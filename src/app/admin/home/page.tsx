'use client'
import { Title } from "@/components/Title";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const Home = () => {
  const { data: session, status } = useSession()
  return (
    <div>
      <Title>Welcome  {session?.user.name} ! </Title>
    </div>    
  );
};

export default Home;


