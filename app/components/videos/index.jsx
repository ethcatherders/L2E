import { Box } from "@chakra-ui/react";
import { videos } from "../../utils/constants";
import { useState, useEffect } from "react";
export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
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
          height={{ lg: "35rem", md: "30rem", base: "25rem" }}
        >
          <iframe
            src={selectedVideo.embedLink}
            title={selectedVideo.title}
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style={{ borderRadius: 10, width: "100%", height: "100%" }}
          ></iframe>
        </Box>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))",
            gap: "2rem",
            justifyItems: "center",
            justifyContent: "end",
            alignContent: "end",
            marginTop: "2rem",
          }}
        >
          {videos.map((video, index) => {
            return (
              <Box
                key={index}
                width={"100%"}
                height={{ lg: "10rem", md: "8rem" }}
                onClick={() => setSelectedVideo(video)}
                style={{
                  cursor: "pointer",
                  backgroundImage: `url(${video.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: 10,
                  filter:
                    selectedVideo.title === video.title
                      ? "brightness(20%)"
                      : "brightness(70%)",
                }}
              >
                <img
                  src={video.imgPath}
                  alt={video.title}
                  style={{ borderRadius: 10, height: "100%", width: "100%" }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
}
