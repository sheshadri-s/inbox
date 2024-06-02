import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { CloudWatch, GetMetricStatisticsCommand, Statistic } from '@aws-sdk/client-cloudwatch';
import sgMail from '@sendgrid/mail';
import PQueue from 'p-queue';

const sendgridApiKey = process.env.SENDGRID_ACCESS_KEY;
if (!sendgridApiKey) {
  throw new Error('SendGrid API key is not defined in environment variables');
}

sgMail.setApiKey(sendgridApiKey);

// Utility function to split an array into chunks of a specific size
const chunkArray = (array : any, chunkSize : any) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const queue = new PQueue({ concurrency: 5 }); // Adjust concurrency level as needed

export const sendEmail = async ({
  to,
  from,
  subject,
  body,
  tag,
  schedule = null,
  emailIDs,
} : any) => {
  try {
    // Split the recipients into batches of 1000
    const batches = chunkArray(to, 1000);
    const idBatches = chunkArray(emailIDs, 1000); // Corresponding ID batches

    // Process each batch with concurrency control
    const batchPromises = batches.map((batch, batchIndex) => {
      return queue.add(() => {
        // Create a mapping of emails to their unique IDs
        const customArgs = batch.reduce((args : any, email : any, index : any) => {
          args[email] = { unique_arg: idBatches[batchIndex][index] };
          return args;
        }, {});

        const msg = {
          personalizations: batch.map((email : any, index : any) => ({
            to: email,
            custom_args: { unique_arg: idBatches[batchIndex][index] },
          })),
          from: from,
          subject: subject,
          text: body,
          html: body,
          customArgs: { tag },
          sendAt: schedule?.sendAt,
        };

        return sgMail.send(msg)
          .then(() => {
            console.log(`Batch of ${batch.length} emails sent successfully!`, msg);
          })
          .catch(error => {
            console.error('Error sending batch:', error);
          });
      });
    });

    // Wait for all batches to be processed
    await Promise.all(batchPromises);
  } catch (error) {
    console.error('Error:', error);
  }
};


    /*
    const sesClient = new SESClient({
        region: 'eu-north-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_KEY_ID!,
        },
    });

    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Text: {
                    Data: body,
                },
                Html: {
                    Data: body, // Assuming you want to send the same content as HTML
                }
            },
            Subject: {
                Data: subject,
            },
        },
        Source: from,
        ConfigurationSetName: 'email-tracking' , // Replace with your actual configuration set name
        Tags: [
            {
                Name: 'Campaign',
                Value: tag,
            },
        ],
    };

    try {
        const response = await sesClient.send(new SendEmailCommand(params));
        console.log('Email sent successfully with tag:', tag);
        return response; // Return the response for further processing if needed
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }

    */


export const getEmailAnalytics = async (propsData: any) => {
    const cloudWatchClient = new CloudWatch({
        region: 'eu-north-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_KEY_ID!,
        },
    });

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours in milliseconds
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); // Subtract 48 hours in milliseconds

    const params = {
        Namespace: 'AWS/SES',
        MetricName: 'Send',
        StartTime: fortyEightHoursAgo, // Use the broader start time
        EndTime: now, // Current time is the end time
        Period: 60 * 60, // Period in seconds (1 hour)
        Statistics: [Statistic.Sum],
        Dimensions: [
            {
                Name: 'Campaign',
                Value: propsData.value,
            },
        ],
    };

    try {
        const data = await cloudWatchClient.send(new GetMetricStatisticsCommand(params));
        console.log('CloudWatch metrics:', data);

        // Check if Datapoints is defined and has data
        if (data.Datapoints && data.Datapoints.length > 0) {
            console.log('Metrics data points:', data.Datapoints);
        } else {
            console.log('No data points found for the given metric and dimensions.');
        }

        return data;
    } catch (error) {
        console.error('Error retrieving CloudWatch metrics:', error);
        throw new Error('Error retrieving CloudWatch metrics');
    }
}