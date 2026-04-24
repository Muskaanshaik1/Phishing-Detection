@RestController
@RequestMapping("/api/sms")
@CrossOrigin(origins = "*") 
public class SmsPhishingController {

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/check")
    public Map<String, Object> checkSms(@RequestBody Map<String, String> body) {
        // This MUST match the Python route we fixed in app.py
        String pythonUrl = "http://localhost:5000/predict/sms";
        
        // Forwarding the SMS text to the Python 'Brain'
        return restTemplate.postForObject(pythonUrl, body, Map.class);
    }
}