document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
    
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    document.querySelector('#compose-form').onsubmit = () =>{
        let recipients = document.querySelector('#compose-recipients').value;
        let subject = document.querySelector('#compose-subject').value;
        let body = document.querySelector('#compose-body').value;

        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
          })
          .then(response => response.json())
          .then(result => {
              // Print result
              console.log(result)
              if(result.message === "Email sent successfully."){
                load_mailbox('sent')
              }
              else{
                document.querySelector('#compose-recipients').value = '';
                document.querySelector('#compose-subject').value = '';
                document.querySelector('#compose-body').value = '';
                document.querySelector('#response').innerHTML = result.error;
              }
          });

        return false;
    };

    
}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        emails.forEach(element => {
            const div = document.createElement('div');
            div.className = 'email';
            if(element.read){
                div.style.backgroundColor = 'rgb(200, 200, 200)';
            }
            div.innerHTML = `<div class="sender">${element.sender}</div>  <div class="subject">${element.subject}</div>   <div class="time">${element.timestamp}</div>`
            div.addEventListener('click', ()=>{
                view_email(element.id);
            });
            document.querySelector('#emails-view').append(div)
        });
    });


}

function view_email(id){
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';


    document.querySelector('#email-view').innerHTML = '';


    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        const div = document.createElement('div');
        div.className='mail';
        const info = document.createElement('p');
        info.innerHTML = ` <strong>From:</strong> ${email.sender} <br>
                        <strong>To:</strong> ${email.recipients} <br>
                        <strong>Subject:</strong> ${email.subject} <br>
                        <strong>Timestamp:</strong> ${email.timestamp} <br>`;
        div.append(info);

        const reply = document.createElement('button');
        reply.classList="btn btn-sm btn-outline-primary me-4";
        reply.id="reply";
        reply.innerHTML="Reply";
        div.append(reply);

        const archive = document.createElement('button');
        archive.classList="btn btn-sm btn-outline-primary";
        archive.id="archive";
        if(!email.archived){
            archive.innerHTML="Archive";
            div.append(archive);
    
            archive.addEventListener('click', ()=>{
                fetch(`/emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                  })
                  load_mailbox('inbox');
            });
        }
        else{
            archive.innerHTML="Dearchive";
            div.append(archive);
    
            archive.addEventListener('click', ()=>{
                fetch(`/emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  })
                  load_mailbox('inbox');
            });
        }

        const body = document.createElement('p');
        body.innerHTML = `<hr>${email.body}`;
        div.append(body);

        document.querySelector('#email-view').append(div);

        

        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
          
    });

}