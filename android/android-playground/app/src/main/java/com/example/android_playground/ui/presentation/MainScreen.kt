package com.example.android_playground.ui.presentation


import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import com.example.android_playground.viewmodel.MainViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Runnable

@Composable
fun MainScreen(viewModel: MainViewModel) {
    val isUserLoggedInState = viewModel.isLoggedIn.collectAsState()
    Log.d("isUserLoggedInState", isUserLoggedInState.toString())
    if(isUserLoggedInState.value) {
        viewModel.getBalance()
        HomeScreen(viewModel = viewModel)
    } else {
        LoginScreen(viewModel = viewModel)
    }
}