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
  Spinner,
  Input,
  Heading
} from "@chakra-ui/react";

/*
  Create a new course using a form.
*/

export default function CreateCourse() {
  async function submitNewCourseFromFile(e) {
    e.preventDefault();
    // call a POST fetch request to API for parsing and appending to database
  }

  return (
    <Layout>
      <Container paddingTop={5} paddingBottom={5}>
        <Heading mb={5}>Create a New Course</Heading>
        <form method="POST" onSubmit={submitNewCourseFromFile}>
          <FormControl>
            <FormLabel>Upload a file ending in either .xls, .xlsx, .json or .csv</FormLabel>
            <Input type='file' name="upload" accept=".xls,.xlsx,.json,.csv" />
          </FormControl>
        </form>
      </Container>
    </Layout>
  )
}