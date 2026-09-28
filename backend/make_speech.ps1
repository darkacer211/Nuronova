Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SetOutputToWaveFile("c:\Users\athar\Thinksky\backend\test_animals.wav")
$s.Speak("lion elephant tiger bear monkey dog cat")
$s.Dispose()
Write-Host "Created test_animals.wav"
