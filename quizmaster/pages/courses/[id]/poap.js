import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Container, Text, Button, Center, Heading, HStack, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from "next/link";

import Layout from "../../../components/Layout";

export default function Poap() {
  const [course, setCourse] = useState({});
  const [poaps, setPoaps] = useState([]);
  const [assignedPoapId, setAssignedPoapId] = useState(null);
  const [currentPoap, setCurrentPoap] = useState(null)
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isInitialized, Moralis } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized && router.query.id) {
      await getCourse();
      await getPoaps();
    }
  }, [isInitialized, router.query.id]);

  async function courseFromMoralis() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;
    return await query.get(id);
  }

  async function getCourse() {
    try {
      const result = await courseFromMoralis();
      console.log(result)
      return setCourse(result.attributes);
    } catch (error) {
      console.error(error);
    }
  }

  async function getPoaps() {
    try {
      const POAP = Moralis.Object.extend("POAP");
      const query = new Moralis.Query(POAP);
      const result = await query.find();
      console.log(result);
      setPoaps(result);

      const current = result.find(poap => poap.attributes.course && poap.attributes.course.id === router.query.id)
      console.log(current)
      setAssignedPoapId(current.id)
      setCurrentPoap(current)
    } catch (error) {
      console.error(error);
    }
  }

  async function submitAttachment(e) {
    e.preventDefault();

    setSuccess(false);
    setError(false);
    setLoading(true);

    try {
      if (!assignedPoapId) throw Error('No POAP was assigned');
      const POAP = Moralis.Object.extend("POAP");
      const query = new Moralis.Query(POAP);
      const poap = await query.get(assignedPoapId);
      const currentCourse = await courseFromMoralis();
      poap.set("course", currentCourse);
      await poap.save();
      setSuccess(true)
    } catch (error) {
      console.error(error);
      setError(true)
    }
    setLoading(false)
  }

  return (
    <Layout>
      <Container>
        <HStack mt={5} mb={10} justifyContent="space-between">
          <Heading>Attach POAP</Heading>
          <Link href={`/courses/${router.query.id}`} passHref>
            <Button>Back To Course</Button>
          </Link>
        </HStack>
        <form onSubmit={submitAttachment}>
          <Text textAlign="center">Attach a POAP to the following course:</Text>
          <Heading size="lg" textAlign="center">{course.title}</Heading>
          <Text textAlign='center' mt={4}>Current POAP: {currentPoap ? currentPoap.attributes.name : 'None'}</Text>
          <Select mt={5} placeholder="Select one" defaultValue={assignedPoapId} onChange={(e) => setAssignedPoapId(e.currentTarget.value)}>
            {poaps.map((poap, index) => 
              <option value={poap.id} key={index}>{poap.attributes.name}</option>
            )}
          </Select>
          {error ? <Text color="red">Something went wrong.</Text> : ''}
          {success ? <Text color="green">The POAP has been assigned!</Text> : ''}
          <Center mt={5}>
            <Button type="submit" isLoading={loading}>Attach</Button>
          </Center>
        </form>
      </Container>
    </Layout>
  )
}