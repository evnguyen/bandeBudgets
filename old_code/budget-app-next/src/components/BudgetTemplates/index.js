import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const BudgetTemplates = ({ open, onClose, onApplyTemplate, onBack }) => {
  const templates = [
    {
      id: "single",
      name: "Single Person",
      description: "Perfect for individuals living independently",
      income: 3500,
      categories: [
        { name: "Housing", planned: 1200, isSpendingType: true },
        { name: "Food", planned: 400, isSpendingType: true },
        { name: "Transportation", planned: 300, isSpendingType: true },
        { name: "Utilities", planned: 150, isSpendingType: true },
        { name: "Insurance", planned: 150, isSpendingType: true },
        { name: "Entertainment", planned: 200, isSpendingType: true },
        { name: "Savings", planned: 500, isSpendingType: true },
        { name: "Emergency Fund", planned: 200, isSpendingType: true },
        { name: "Debt Payment", planned: 300, isSpendingType: true },
        { name: "Salary", planned: 3500, isSpendingType: false },
      ],
    },
    {
      id: "family",
      name: "Family of 4",
      description: "Designed for families with children",
      income: 6500,
      categories: [
        { name: "Housing", planned: 2000, isSpendingType: true },
        { name: "Food", planned: 800, isSpendingType: true },
        { name: "Transportation", planned: 600, isSpendingType: true },
        { name: "Utilities", planned: 250, isSpendingType: true },
        { name: "Insurance", planned: 300, isSpendingType: true },
        { name: "Children", planned: 600, isSpendingType: true },
        { name: "Entertainment", planned: 300, isSpendingType: true },
        { name: "Savings", planned: 1000, isSpendingType: true },
        { name: "Emergency Fund", planned: 400, isSpendingType: true },
        { name: "Debt Payment", planned: 450, isSpendingType: true },
        { name: "Salary", planned: 6500, isSpendingType: false },
      ],
    },
    {
      id: "student",
      name: "College Student",
      description: "Budget for students with part-time income",
      income: 1800,
      categories: [
        { name: "Housing", planned: 600, isSpendingType: true },
        { name: "Food", planned: 250, isSpendingType: true },
        { name: "Transportation", planned: 150, isSpendingType: true },
        { name: "Books & Supplies", planned: 200, isSpendingType: true },
        { name: "Entertainment", planned: 100, isSpendingType: true },
        { name: "Savings", planned: 200, isSpendingType: true },
        { name: "Emergency Fund", planned: 100, isSpendingType: true },
        { name: "Part-time Job", planned: 1800, isSpendingType: false },
      ],
    },
    {
      id: "retiree",
      name: "Retiree",
      description: "Budget for those living on fixed income",
      income: 2800,
      categories: [
        { name: "Housing", planned: 1000, isSpendingType: true },
        { name: "Food", planned: 400, isSpendingType: true },
        { name: "Healthcare", planned: 300, isSpendingType: true },
        { name: "Transportation", planned: 250, isSpendingType: true },
        { name: "Utilities", planned: 150, isSpendingType: true },
        { name: "Insurance", planned: 200, isSpendingType: true },
        { name: "Entertainment", planned: 150, isSpendingType: true },
        { name: "Savings", planned: 200, isSpendingType: true },
        { name: "Emergency Fund", planned: 150, isSpendingType: true },
        {
          name: "Pension/Social Security",
          planned: 2800,
          isSpendingType: false,
        },
      ],
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Ultra-focused on saving and debt elimination",
      income: 4200,
      categories: [
        { name: "Housing", planned: 800, isSpendingType: true },
        { name: "Food", planned: 300, isSpendingType: true },
        { name: "Transportation", planned: 200, isSpendingType: true },
        { name: "Utilities", planned: 100, isSpendingType: true },
        { name: "Insurance", planned: 150, isSpendingType: true },
        { name: "Debt Payment", planned: 1500, isSpendingType: true },
        { name: "Savings", planned: 1000, isSpendingType: true },
        { name: "Emergency Fund", planned: 150, isSpendingType: true },
        { name: "Salary", planned: 4200, isSpendingType: false },
      ],
    },
  ];

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {onBack && (
          <IconButton
            onClick={onBack}
            size="small"
            sx={{ mr: 1 }}
            title="Back to setup options"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        Choose a Budget Template
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a template that matches your lifestyle. You can customize it
          after applying.
        </Typography>

        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} key={template.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleApplyTemplate(template)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {template.description}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={`$${template.income.toLocaleString()}/month`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Key Categories:
                  </Typography>
                  <Stack spacing={0.5}>
                    {template.categories.slice(0, 4).map((category, index) => (
                      <Typography
                        key={index}
                        variant="caption"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: category.isSpendingType
                            ? "text.primary"
                            : "success.main",
                        }}
                      >
                        <span>{category.name}</span>
                        <span>${category.planned}</span>
                      </Typography>
                    ))}
                    {template.categories.length > 4 && (
                      <Typography variant="caption" color="text.secondary">
                        +{template.categories.length - 4} more categories...
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
