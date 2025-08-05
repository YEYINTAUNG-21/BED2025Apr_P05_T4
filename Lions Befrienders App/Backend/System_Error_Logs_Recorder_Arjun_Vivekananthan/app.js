const errorLogsController = require('./controllers/errorLogsController');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/error-logs', errorLogsController.getAllErrorLogs);
app.post('/api/error-logs', errorLogsController.createErrorLog);
app.put('/api/error-logs/:id', errorLogsController.updateErrorLogAction);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
