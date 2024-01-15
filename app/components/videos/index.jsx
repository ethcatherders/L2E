import { Box } from "@chakra-ui/react";
import { videos } from "../../utils/constants";
export default function Videos() {
  return (
    <>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
          gap: "3rem",
          justifyItems: "center",
          justifyContent: "end",
          alignContent: "end",
        }}
      >
        {videos.map((video, index) => {
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
        })}
      </Box>
    </>
  );
}
