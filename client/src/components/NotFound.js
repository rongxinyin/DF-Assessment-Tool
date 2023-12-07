import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  let navigate = useNavigate(); // navigate to diff pages

  return (
    <div style={{ maxWidth: 350, margin: "auto" }}>
      <Typography variant="h2" gutterBottom sx={{ marginTop: 5 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        The page you were looking for was not found. 😞
      </Typography>

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        size="large"
        sx={{ marginBottom: 1 }}
        onClick={() => navigate("/")}
      >
        Go Home
      </Button>
    </div>
  );
}
