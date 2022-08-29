import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from 'next/router';
import Layout from "../../../components/Layout";
import { 
  Box,
  Button,
  ButtonGroup,
  Center,
  Container, 
  Divider, 
  Heading, 
  HStack, 
  Image, 
  Input, 
  Radio, 
  RadioGroup, 
  Spinner, 
  Text,
  VStack
} from "@chakra-ui/react";
import Link from "next/link";

/*
  An editable form to make changes to an existing course.
*/

export default function EditCourse() {
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { isInitialized, Moralis, user } = useMoralis();
  const router = useRouter();

  useEffect(async () => {
    if (isInitialized) {
      await getCourse();
    }
  }, [isInitialized]);

  useEffect(async () => {
    const {id} = router.query;
    if (isInitialized && id) {
      await getCourse();
    }
  }, [router.query.id]);

  async function getCourse() {
    const Course = Moralis.Object.extend("Course");
    const query = new Moralis.Query(Course);
    const { id } = router.query;

    try {
      const result = await query.get(id);
      console.log(result)
      return setCourse(result.attributes);
    } catch (error) {
      console.error(error);
    }
  }

  function changeTitle(newTitle) {
    const newCourse = {...course};
    newCourse.title = newTitle;
    setCourse(newCourse);
  }

  function changeVideoUrl(newVideoUrl) {
    const newCourse = {...course};
    newCourse.videoUrl = newVideoUrl;
    setCourse(newCourse);
  }

  function changeVideoLength(newVideoLength) {
    const newCourse = {...course};
    newCourse.videoDuration = newVideoLength;
    setCourse(newCourse);
  }

  function changeSpeakerName(newSpeakerName) {
    const newCourse = {...course};
    newCourse.speaker = newSpeakerName;
    setCourse(newCourse);
  }

  async function changeSpeakerImage(newImage) {
    setUploading(true)
    try {
      // const data = e.currentTarget.files[0]
      const file = new Moralis.File(newImage.name, newImage)
      await file.saveIPFS()

      const newCourse = {...course};
      newCourse.speakerImg = file.hash();
      setCourse(newCourse);

      console.log("Avatar Image:", file.hash())
    } catch (error) {
      console.error(error)      
    }
    setUploading(false)
  }

  function changeSpeakerTwitterUrl(newTwitterUrl) {
    const newCourse = {...course};
    newCourse.speakerTwitterUrl = newTwitterUrl;
    setCourse(newCourse);
  }

  function changeQuestion(index, newQuestion) {
    const newCourse = {...course};
    newCourse.quiz[index].question = newQuestion;
    setCourse(newCourse);
  }

  function changeAnswer(quizIndex, newAnswer) {
    const newCourse = {...course};
    newCourse.quiz[quizIndex].answer = newAnswer;
    setCourse(newCourse);
  }

  function changeOption(quizIndex, optIndex, newOption) {
    const newCourse = {...course};
    newCourse.quiz[quizIndex].options[optIndex] = newOption;
    setCourse(newCourse);
  }

  async function submitChanges(e) {
    e.preventDefault();

    setError(false);
    setSuccess(false);
    setLoading(true);

    // Upload changes to database
    try {
      const Course = Moralis.Object.extend("Course");
      const query = new Moralis.Query(Course);
      const { id } = router.query;

      const result = await query.get(id);
      result.set("updatedBy", user)
      await result.save(course);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(true);
    }

    setLoading(false);
  }

  return (
    <Layout>
      {course ? 
        <Container mb={20}>
          <HStack mt={5} mb={10} justifyContent="space-between">
            <Heading>Edit Course</Heading>
            <VStack>
              <ButtonGroup mt={5}>
                <Link href={`/courses/${router.query.id}`} passHref>
                  <Button>Go Back</Button>
                </Link>
                <Button type="button" onClick={getCourse}>Reset</Button>
              </ButtonGroup>
              <Button type="submit" width='100%' isLoading={loading}>Save Changes</Button>
            </VStack>
          </HStack>
          <form onSubmit={submitChanges}>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Title:</Heading>
              <Input value={course.title} onChange={(e) => changeTitle(e.currentTarget.value)} />
            </VStack>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Video URL:</Heading>
              <Input value={course.videoUrl} onChange={(e) => changeVideoUrl(e.currentTarget.value)} />
            </VStack>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Video Length (in minutes):</Heading>
              <Input value={course.videoDuration} onChange={(e) => changeVideoLength(e.currentTarget.value)} />
            </VStack>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Speaker's Name:</Heading>
              <Input value={course.speaker} onChange={(e) => changeSpeakerName(e.currentTarget.value)} />
            </VStack>
            <HStack mb={5} width='100%' gap={2}>
              <VStack alignItems="flex-start" flexGrow={1}>
                <Heading size="sm">Speaker's Profile Pic (400 x 400):</Heading>
                <Input value={course.speakerImg} onChange={(e) => changeSpeakerImage(e.currentTarget.files[0])} type='file' />
              </VStack>
              <Image
                src={course.speakerImg && `https://gateway.moralisipfs.com/ipfs/${course.speakerImg}`} 
                width={100} 
                height={100} 
                objectFit='cover' 
                borderRadius={10}
                fallback={uploading && <Spinner width={100} height={100} />}
              />
            </HStack>
            <VStack alignItems="flex-start" mb={5}>
              <Heading size="sm">Speaker's Twitter:</Heading>
              <Input value={course.speakerTwitterUrl} onChange={(e) => changeSpeakerTwitterUrl(e.currentTarget.value)} />
            </VStack>
            <hr />
            <Heading mt={5} mb={5}>Quiz</Heading>
            {course.quiz.map((quizItem, index) =>
              <Box mb={10} key={index}>
                <HStack>
                  <Heading size="md">Q{quizItem.id}:</Heading>
                  <Input value={quizItem.question} onChange={(e) => changeQuestion(index, e.currentTarget.value)} />
                </HStack>
                <VStack alignItems="flex-start" mt={5} width='100%'>
                  <Heading size="sm">Multiple Choice Options:</Heading>
                  <RadioGroup defaultValue={quizItem.answer} width='100%'>
                    <VStack width='100%'>
                    {quizItem.options.map((option, optIndex) =>
                      <HStack width='100%' key={optIndex}>
                        <Radio value={option} onChange={(e) => changeAnswer(index, e.currentTarget.value)} />
                        <Input value={option} onChange={(e) => changeOption(index, optIndex, e.currentTarget.value)} />
                      </HStack>
                    )}
                    </VStack>
                  </RadioGroup>
                </VStack>
                <Heading size="sm" mt={5}>Answer: {quizItem.answer}</Heading>
              </Box>
            )}
            
            <Divider mb={5} />

            <Heading mb={5}>Extra Resources</Heading>
            {course.resources && course.resources.length ? course.resources.map((resource, index) => 
              <VStack key={index} align='left' gap={0}>
                <Text>{resource.description}</Text>
                <Link href={resource.link}>{resource.link}</Link>
              </VStack>
            ) : <Text>There are no additional resources for this course.</Text>}
            {error ? <Text color="red">Something went wrong.</Text> : ''}
            {success ? <Text color="green">Your changes have been saved!</Text> : ''}
            <ButtonGroup mt={5}>
              <Button type="submit" mr={2} isLoading={loading}>Save Changes</Button>
              <Button type="button" onClick={getCourse}>Reset</Button>
            </ButtonGroup>
          </form>
        </Container>
        :
        <Container>
          No Course Found
        </Container>
      }
    </Layout>
  )
}