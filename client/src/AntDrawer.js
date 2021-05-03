import React from 'react';
import 'antd/dist/antd.css';
import './AntDrawer.css';
import { Row, Col,  Drawer, Button, Space } from 'antd';
import { GlobalOutlined, VideoCameraAddOutlined } from '@ant-design/icons';

function AntDrawer(props) {

    const [isOpen, setIsOpen] = React.useState(false);
    const toggleDrawer = () => setIsOpen(!isOpen);

    return (
        <>
        <Button 
            className="button" 
            type="light" 
            onClick={toggleDrawer}
            >
        </Button>
        <Drawer
            className="drawer"
            title="Tools"
            placement="left"
            closable={true}
            visible={isOpen}
            width={220}
        >
        <Space direction="vertical">
            <Button 
                className="a-btn"
                block={true}>
                <div>
                <Row>
                    <Col span={6}> 
                        <GlobalOutlined style={{ fontSize: '20px'}}/>
                    </Col>
                    <Col span={16}>
                        <b>B1</b>
                    </Col>
                </Row>
            </div>
            </Button>
            <Button 
                className="b-btn"
                block={true}>
                <div>
                <Row>
                    <Col span={6}> 
                        <VideoCameraAddOutlined style={{ fontSize: '20px'}}/>
                    </Col>
                    <Col span={16}>
                        <b>B2</b>
                    </Col>
                </Row>
            </div>
            </Button>
        </Space>
        </Drawer>
        </>
    );
}
export default AntDrawer;