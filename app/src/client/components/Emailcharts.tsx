import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaceIcon, ImageIcon, SunIcon } from '@radix-ui/react-icons';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const data = [
  { name: 'DELIVERED', emails: 210 },
  { name: 'OPENED', emails: 95 },
  { name: 'CLICKED', emails: 11 },
  { name: 'BOUNCED', emails: 18 },
];

const stats = [
  { title: 'Total Mails Sent', value: '334', icon: <SunIcon /> },
  { title: 'Open Rate', value: '70%', icon: <FaceIcon /> },
  { title: 'Delivery Rate', value: '95%', icon: <ImageIcon /> },
  { title: 'Bounce Rate', value: '5%', icon: <SunIcon /> },
];

const EmailStatusChart = () => {
  return (
    <Box sx={{ height : '60vh' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <div className="flex flex-col items-center p-4 h-full bg-white border border-gray-200 rounded-xl shadow-none">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-center">
                    <h6 className="text-lg font-medium mb-2">{stat.title}</h6>
                    <h4 className="text-2xl font-bold">{stat.value}</h4>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="emails" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmailStatusChart;
