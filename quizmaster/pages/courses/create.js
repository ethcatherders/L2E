import { useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../components/Layout";
import { 
  Container, 
  FormControl,
  FormLabel,
  Button,
  Text,
  Input,
  Heading
} from "@chakra-ui/react";
import { read } from 'xlsx';

export default function CreateCourse() {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false)
  const { Moralis, user } = useMoralis();

  async function submitNewCourseFromFile(e) {
    e.preventDefault();
    // call a POST fetch request to API for parsing and appending to database
    setSuccess(false);
    setError(false);
    setSubmitting(true);
    try {
      const fileList = document.getElementById('file').files;
      console.log(fileList[0].name);
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(fileList[0]);
      fileReader.onload = async (e) => {
        try {
          const workbook = read(e.target.result, {type: 'binary'});
          const sheetNames = workbook.SheetNames;
          const courses = [];
          for(let i=0; sheetNames.length > i; i++) {
            const sheet = workbook.Sheets[sheetNames[i]];
            const title = sheet.B1.v;
            const speaker = sheet.B2.v;
            const speakerTwitterUrl = (sheet.B3 && sheet.B3.v) ?? undefined;
            const videoUrl = sheet.B4.v;
            const videoDuration = parseInt(sheet.B5.v);
    
            let active = true;
            const quiz = [];
            for(let x=9; active; x++) {
              if (!sheet[`A${x}`]) break
              const id = x - 8;
              const question = sheet[`A${x}`].v;
              const options = []
              if (sheet[`B${x}`] && sheet[`B${x}`].v) {
                options.push(sheet[`B${x}`].v)
              }
              if (sheet[`C${x}`] && sheet[`C${x}`].v) {
                options.push(sheet[`C${x}`].v)
              }
              if (sheet[`D${x}`] && sheet[`D${x}`].v) {
                options.push(sheet[`D${x}`].v)
              }
              if (sheet[`E${x}`] && sheet[`E${x}`].v) {
                options.push(sheet[`E${x}`].v)
              }
              // const options = [sheet[`B${x}`].v, sheet[`C${x}`].v, sheet[`D${x}`].v, sheet[`E${x}`].v];
              const answer = sheet[`F${x}`].v;
              const quizItem = { id, question, options, answer };
              quiz.push(quizItem);
            }
            const resources = []
            for(let y=9; active; y++) {
              if (!sheet[`H${y}`]) break
              const description = sheet[`H${y}`].v
              const link = sheet[`I${y}`].v
              const resourceItem = { description, link }
              resources.push(resourceItem)
            }

            courses.push({
              title,
              videoUrl,
              videoDuration,
              speaker,
              speakerTwitterUrl,
              quiz,
              responses: [],
              resources,
              createdBy: user
            });
          }
    
          console.log("Courses:", courses);
          for(let y=0; courses.length > y; y++) {
            await uploadCourse(courses[y]);
          }
          setSuccess(true);
          console.log("Success!");
        } catch (error) {
          console.error(error);
          setError(true);
        }
      }
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setSubmitting(false)
  }

  async function uploadCourse(courseData) {
    const Course = Moralis.Object.extend("Course");
    const course = new Course();
    await course.save(courseData);
  }

  return (
    <Layout>
      <Container paddingTop={5} paddingBottom={5}>
        <Heading mb={5}>Create a New Course</Heading>
        <form method="POST" onSubmit={submitNewCourseFromFile}>
          <FormControl>
            <FormLabel>Upload a file ending in .xlsx</FormLabel>
            <Input type='file' id="file" name="upload" accept=".xlsx" />
          </FormControl>
          {error ? <Text color="red">Something went wrong.</Text> : ''}
          {success ? <Text color="green">Successfully uploaded course(s)!</Text> : ''}
          <Button type="submit" marginTop={5} isLoading={submitting} loadingText='Processing...'>Submit</Button>
        </form>
      </Container>
    </Layout>
  )
}