import {
    Container,
    Paper,
    Stack,
    Typography,
    Button,
    Link,
} from "@mui/material";

export default function Report() {
    return (
        <Container maxWidth="sm">
            <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mt: 4, borderRadius: 2 }}>
                <Stack spacing={2} textAlign="left">
                    <Typography variant="h4" component="h1">
                        Submit an Encounter Report
                    </Typography>

                    <Typography variant="body1">
                        Public report submission is not available yet. This platform is still in its early
                        stages and currently focuses on mapping and organizing existing public data.
                    </Typography>

                    <Typography variant="body1">
                        As the project grows and infrastructure is built, secure report submission will be
                        added—allowing witnesses to share encounters without fear of identification, ridicule, misuse, or loss
                        of context.
                    </Typography>

                    <Typography variant="body2">
                        In the meantime, you can:
                    </Typography>

                    <Stack spacing={1} sx={{ pl: 2 }}>
                        <Typography variant="body2">
                            • Explore mapped encounter data
                        </Typography>
                        <Typography variant="body2">
                            • Share the project with others
                        </Typography>
                        <Typography variant="body2">
                            • Support development via{" "}
                            <Link
                                href="https://www.gofundme.com/f/mapping-sasquatch"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GoFundMe
                            </Link>
                        </Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                        Report submission will be announced once available.
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}