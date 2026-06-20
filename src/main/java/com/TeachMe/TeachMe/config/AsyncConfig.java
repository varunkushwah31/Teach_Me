package com.TeachMe.TeachMe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync // Activates Spring's background processing capabilities
@EnableScheduling
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 1. Set core pool size: Minimum number of keeping-alive threads
        executor.setCorePoolSize(5);

        // 2. Set maximum pool size: Max number of threads allowed to scale under load
        executor.setMaxPoolSize(10);

        // 3. Set queue capacity: Number of tasks that can queue up before scaling threads
        executor.setQueueCapacity(100);

        // 4. Set thread name prefix: Helps significantly when debugging thread dumps/logs
        executor.setThreadNamePrefix("IngestionThread-");

        // 5. Rejection Policy: What to do when queue is full and max threads are busy
        // CallerRunsPolicy forces the submission thread (HTTP container thread) to run the task,
        // which naturally throttles the incoming upload rate.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // 6. Ensure threads tear down properly when the application shuts down
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);

        executor.initialize();
        return executor;
    }
}