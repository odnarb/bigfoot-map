import headerImage from "../assets/x-header.png";
import {
    Box,
    Container,
    Paper,
    Stack,
    Typography,
    Divider,
    Button,
    Chip,
    Link,
} from "@mui/material";

export default function About() {
    return (
        <Box>
            {/* Header image */}
            <Box
                sx={{
                    width: "100%",
                    height: { xs: 140, sm: 180, md: 220 },
                    overflow: "hidden",
                    mb: 2,
                }}
            >
                <Box
                    component="img"
                    src={headerImage}
                    alt="Mapping Sasquatch header"
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 28%",
                    }}
                />
            </Box>

            <Container maxWidth="md">
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Typography variant="h3" component="h1">
                        About Mapping Sasquatch
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        A free, open-source mapping and analysis project for Sasquatch encounter data.
                    </Typography>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button
                            variant="contained"
                            href="https://www.gofundme.com/f/mapping-sasquatch"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Support on GoFundMe
                        </Button>
                        <Button
                            variant="outlined"
                            href="https://github.com/odnarb/mapping-sasquatch"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View the Code on GitHub
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label="Open-source" size="small" />
                        <Chip label="Community-funded" size="small" />
                        <Chip label="Mapping + Filters" size="small" />
                        <Chip label="AI-assisted analysis" size="small" />
                    </Stack>
                </Stack>

                <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                    <Stack spacing={2} sx={{ textAlign: "left" }}>
                        <Typography variant="h5">Mission</Typography>
                        <Typography>
                            To document and openly share the locations, patterns, and behaviors associated with
                            Sasquatch encounters, and to preserve this information in a way that allows real
                            analysis rather than endless speculation.
                        </Typography>

                        <Typography>
                            This project is not about convincing people that Sasquatches exist. That question is
                            already settled for many who have experienced encounters firsthand.
                        </Typography>

                        <Typography>
                            People’s lives have been disrupted—sometimes permanently—by encounters they never asked
                            for. I’m one of them. Many others have no platform, no context, and no way to understand
                            what happened to them.
                        </Typography>

                        <Typography>
                            Governments in the United States and Canada continue to deny the existence—and full
                            capabilities—of these beings. Meanwhile, witnesses are dismissed, ridiculed, or ignored.
                            This platform exists to preserve data and allow patterns to speak for themselves.
                        </Typography>

                        <Divider />

                        <Typography variant="h5">About the Project</Typography>
                        <Typography>
                            One of the biggest problems in the cryptid community is fragmentation. Encounter
                            reports, media, and analysis are scattered across social platforms, forums, and isolated
                            websites, making it difficult to see patterns or validate correlations.
                        </Typography>

                        <Typography>
                            Mapping Sasquatch is an open-source project designed to centralize historical and modern
                            encounter data into a single, durable platform. The goal is to create a level playing
                            field where all aspects of encounters can be shared openly, without gatekeeping or
                            hidden narratives.
                        </Typography>

                        <Typography>
                            This platform modernizes how this information is stored, visualized, and explored, using
                            mapping, filtering, and AI-assisted analysis to surface patterns that would otherwise
                            remain invisible.
                        </Typography>

                        <Divider />

                        <Typography variant="h5">Keep This Information Free</Typography>
                        <Typography>
                            This project is supported entirely by community funding via{" "}
                            <Link
                                href="https://www.gofundme.com/f/mapping-sasquatch"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GoFundMe
                            </Link>.
                            There are no paywalls. Mapping Sasquatch exists to ensure encounter data remains openly accessible, particularly in the absence of transparent, official investigation or acknowledgment.
                        </Typography>

                        <Divider />

                        <Typography variant="h5">Features</Typography>
                        <Typography>
                            Planned and potential features include advanced mapping and filtering of sightings,
                            AI-assisted pattern detection across geography and time, audio and vocalization analysis,
                            media correlation, DNA and biological data visualization using publicly available
                            studies, and environmental overlays such as terrain, water sources, elevation, and
                            remoteness.
                        </Typography>

                        <Typography>
                            AI is used to organize and analyze large datasets—not to draw conclusions or tell anyone
                            what to believe. Features are built based on community feedback and voting.
                        </Typography>

                        <Divider />

                        <Typography variant="h5">Videos / Media / Social</Typography>
                        <Typography>
                            I’m not producing video content yet. If the community grows, I’ll engage wherever it
                            makes the most sense, starting with X (Twitter). Other platforms may include YouTube,
                            Discord, Telegram, or Rumble.
                        </Typography>

                        <Divider />

                        <Typography variant="h5">The Future</Typography>
                        <Typography>
                            If done right, this platform will outpace existing forms of reporting by providing
                            structured, open, and analyzable data. Long-term sustainability may require ongoing
                            community support. Those decisions will be made later.
                        </Typography>

                        <Divider />

                        <Typography variant="h5">About Me</Typography>
                        <Typography>
                            My name is Brandon Chambers. I’m a software engineer with over 20 years of professional
                            experience building and scaling web platforms. I built this platform because the
                            community deserves better tools to preserve and understand this information.
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}