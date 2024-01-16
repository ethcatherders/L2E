import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import {
  Container,
  AspectRatio,
  Button,
  Center,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "../../../components/Layout";
import Videos from "../../../components/videos";

export default function Course() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isInitialized, Moralis } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      setCourse(await getCourse());
      setLoading(false);
    }
  }, [isInitialized]);

  useEffect(async () => {
    const { id } = router.query;
    if (isInitialized && id) {
      setCourse(await getCourse());
    }
  }, [router.query.id]);

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      return {
        title: result.attributes.title,
        videoUrl: result.attributes.videoUrl,
      };
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Layout>
      {loading ? (
        <Center>
          <Spinner width={100} height={100} />
        </Center>
      ) : (
        <>
          {course ? (
            <Container maxW="container.lg" paddingTop={5}>
              <Heading textAlign="center" paddingBottom={5}>
                {course.title}
              </Heading>
              {/* <AspectRatio height={450} width='100%'>
              <iframe
                width="560"
                height="315"
                src={course.videoUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </AspectRatio> */}
              {/* <Center paddingTop={5}>
              <Link href={`/courses/${router.query.id}/questions`}>
                <Button>
                  Take Quiz
                </Button>
              </Link>
            </Center> */}
              <Videos />
            </Container>
          ) : (
            <Container>No Course Found</Container>
          )}
        </>
      )}
    </Layout>
  );
}
