package android.WalletCore

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import android.WalletCore.ui.theme.WalletCoreTheme
import android.WalletCore.uniffi.rustGreeting

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WalletCoreTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Greeting(rustGreeting("Android"))
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String) {
    Text(text = "Hello Android")
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    WalletCoreTheme {
        Greeting("Android")
    }
}