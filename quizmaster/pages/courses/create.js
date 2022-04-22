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

/*
  Create a new course using a form.
*/

export default function CreateCourse() {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { Moralis } = useMoralis();

  async function submitNewCourseFromFile(e) {
    e.preventDefault();
    // call a POST fetch request to API for parsing and appending to database
    setSuccess(false);
    setError(false);
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
            const videoUrl = sheet.B2.v;
    
            let active = true;
            const quiz = [];
            for(let x=5; active; x++) {
              if (!sheet[`A${x}`]) break
              const id = x - 4;
              const question = sheet[`A${x}`].v;
              const options = [sheet[`B${x}`].v, sheet[`C${x}`].v, sheet[`D${x}`].v, sheet[`E${x}`].v];
              const answer = sheet[`F${x}`].v;
              const quizItem = { id, question, options, answer };
              quiz.push(quizItem);
            }
            courses.push({ title, videoUrl, quiz, responses: [] });
          }
    
          console.log("Courses: ", courses);
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
          <Button type="submit" marginTop={5}>Submit</Button>
        </form>
      </Container>
    </Layout>
  )
}