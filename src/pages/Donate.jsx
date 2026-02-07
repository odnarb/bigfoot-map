import {
    Box,
    Container,
    Paper,
    Stack,
    Typography,
    Button,
    Link,
} from "@mui/material";

export default function Donate() {
    return (
        <Container maxWidth="sm">
            <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mt: 4, borderRadius: 2 }}>
                <Stack spacing={2} textAlign="left">
                    <Typography variant="h4" component="h1">
                        Support Mapping Sasquatch
                    </Typography>

                    <Typography variant="body1">
                        Mapping Sasquatch is a free, open-source project dedicated to preserving and analyzing
                        encounter data without paywalls, ads, or hidden agendas.
                    </Typography>

                    <Typography variant="body1">
                        Community support directly funds development, infrastructure, and new features such as
                        improved mapping, filtering, and AI-assisted pattern analysis.
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Donations are entirely optional. The platform remains public regardless of contribution.
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        href="https://www.gofundme.com/f/mapping-sasquatch"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Donate via GoFundMe
                    </Button>

                    <Typography variant="caption" color="text.secondary">
                        Prefer not to donate? You can still explore the data or contribute to
                        the project on GitHub.
                    </Typography>

                    <Typography variant="caption">
                        <Link
                            href="https://github.com/odnarb/bigfoot-map"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View the project on GitHub
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}