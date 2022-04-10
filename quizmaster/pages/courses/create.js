import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import Layout from "../../components/Layout";
import { 
  Container, 
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  Radio,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner
} from "@chakra-ui/react";

/*
  Create a new course using a form.
*/

export default function CreateCourse() {
  return (
    <Layout>
      <Container paddingTop={5} paddingBottom={5}>
        <h1>New Courses</h1>
      </Container>
    </Layout>
  )
}