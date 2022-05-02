import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Container, AspectRatio, Box, Text, Button, Center, Heading, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from "next/link";

import Layout from "../../../components/Layout";

export default function Poap() {
  const { isInitialized, Moralis } = useMoralis();

  useEffect(async () => {

  }, [isInitialized]);

  return (
    <Layout></Layout>
  )
}