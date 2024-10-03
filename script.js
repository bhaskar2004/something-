document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const loadingIndicator = document.getElementById('loading');
    const submitButton = form.querySelector('button[type="submit"]');
    const messageTextarea = document.getElementById('message');
    const charCountSpan = document.getElementById('charCount');
    const prioritySlider = document.getElementById('priority');
    const priorityValue = document.getElementById('priorityValue');
    const feedbackDiv = document.getElementById('feedback');

    const maxChars = 500;

    messageTextarea.addEventListener('input', updateCharCount);
    prioritySlider.addEventListener('input', updatePriorityValue);

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!validateForm()) return;

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            setLoadingState(true);
            const response = await sendMessage(payload);
            handleResponse(response);
        } catch (error) {
            console.error('Error:', error);
            showFeedback('Error sending message. Please try again.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                showFeedback(`Please fill in the ${field.name} field.`, 'error');
                field.focus();
                return false;
            }
        }
        if (messageTextarea.value.length > maxChars) {
            showFeedback(`Message exceeds maximum length of ${maxChars} characters.`, 'error');
            messageTextarea.focus();
            return false;
        }
        return true;
    }

    function updateCharCount() {
        const remainingChars = maxChars - messageTextarea.value.length;
        charCountSpan.textContent = remainingChars;
        charCountSpan.style.color = remainingChars < 50 ? 'red' : '';
    }

    function updatePriorityValue() {
        const value = prioritySlider.value;
        const priorities = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
        priorityValue.textContent = priorities[value - 1];
    }

    async function sendMessage(data) {
        const response = await fetch('https://bhaskarmail.vercel.app/send', { // Updated to your backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    }

    function handleResponse(data) {
        if (data.includes('Message sent successfully')) {
            showFeedback('Message sent successfully!', 'success');
            form.reset();
            updateCharCount();
            updatePriorityValue();
        } else {
            showFeedback('An error occurred: ' + data, 'error');
        }
    }

    function setLoadingState(isLoading) {
        submitButton.disabled = isLoading;
        loadingIndicator.classList.toggle('visible', isLoading);
    }

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = type;
        feedbackDiv.classList.add('animate');

        setTimeout(() => {
            feedbackDiv.classList.remove('animate');
        }, 300);

        setTimeout(() => {
            feedbackDiv.textContent = '';
            feedbackDiv.className = '';
        }, 5000);
    }

    // Initialize
    updateCharCount();
    updatePriorityValue();
});
