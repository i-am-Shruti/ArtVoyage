const app = require('./app');
const PORT = process.env.PORT || 1338;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
