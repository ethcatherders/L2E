import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import Layout from "../../../components/Layout";
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
  An editable form to make changes to an existing course.
*/

export default function EditCourse() {
  return (
    <Container></Container>
  )
}