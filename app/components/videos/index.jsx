import { Box, Button, SimpleGrid, GridItem, Image, useColorMode, HStack } from "@chakra-ui/react";
import { videos } from "../../utils/constants";
import { useState, useEffect } from "react";


export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const { colorMode } = useColorMode();

  return (
    <>
      <Box
      // style={{
      //   display: "grid",
      //   gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
      //   gap: "3rem",
      //   justifyItems: "center",
      //   justifyContent: "end",
      //   alignContent: "end",
      // }}
      >
        {/* {videos.map((video, index) => {
          return (
            <iframe
              key={index}
              width="325"
              height="183"
              src={video.embedLink}
              title={video.title}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              style={{ borderRadius: 10 }}
            ></iframe>
          );
        })} */}
        <Box
          width={"100%"}
          height={{ lg: "30rem", md: "25rem", base: "20rem" }}
        >
          <iframe
            src={selectedVideo.embedLink}
            title={selectedVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style={{ borderRadius: 10, width: "100%", height: "100%" }}
          ></iframe>
        </Box>
        <HStack
          width={"100%"}
          justify={selectedVideo.id === 1 ? "flex-end" : "space-between"} 
          align="center"
          mt={2}
        >
          {selectedVideo.id > 1 && (
            <Button 
              backgroundColor={colorMode === "dark"
              ? "rgba(229, 229, 229, 0.13)"
              : "rgba(220, 220, 220, 1)"}
              onClick={() => setSelectedVideo(videos[selectedVideo.id - 2])}
            >
              Previous
            </Button>
          )}
          {videos.length !== selectedVideo.id && (
            <Button 
            backgroundColor={colorMode === "dark"
            ? "rgba(229, 229, 229, 0.13)"
            : "rgba(220, 220, 220, 1)"}
              onClick={() => setSelectedVideo(videos[selectedVideo.id])}
            >
              Next
            </Button>
          )}
        </HStack>

        <SimpleGrid
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
            gap: "2rem",
            justifyItems: "center",
            justifyContent: "end",
            alignContent: "end",
            marginTop: "2rem",
          }}
        >
          {videos.map((video, index) => {
            return (
              <GridItem
                key={index}
                width={"100%"}
                // height={{ lg: "10rem", md: "8rem" }}
                onClick={() => setSelectedVideo(video)}
                cursor="pointer"
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                borderRadius={10}
                borderWidth={4}
                borderColor={selectedVideo.title === video.title ? "transparent" : (colorMode === "dark"
                ? "rgba(229, 229, 229, 0.13)"
                : "rgba(220, 220, 220, 1)")}
                background={
                  colorMode === "dark"
                    ? "rgba(229, 229, 229, 0.13)"
                    : "rgba(220, 220, 220, 1)"
                }
                filter={selectedVideo.title === video.title
                  ? "brightness(20%)"
                  : "brightness(70%)"
                }
                // style={{
                  // cursor: "pointer",
                  // backgroundImage: `url(${video.thumbnail})`,
                  // backgroundSize: "cover",
                  // backgroundPosition: "center",
                  // backgroundRepeat: "no-repeat",
                  // borderRadius: 10,
                  // filter:
                  //   selectedVideo.title === video.title
                  //     ? "brightness(20%)"
                  //     : "brightness(70%)",
                // }}
              >
                <Image
                  src={video.imgPath}
                  alt={video.title}
                  width={"100%"}
                  borderRadius={6}
                />
              </GridItem>
            );
          })}
        </SimpleGrid>
      </Box>
    </>
  );
}
